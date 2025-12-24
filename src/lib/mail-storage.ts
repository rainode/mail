import fs from "node:fs";
import path from "node:path";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { simpleParser } from "mailparser";
import { getDb } from "@/db";
import { emails } from "@/db/schema";

export type Email = {
  id: string;
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string | false;
  date: Date;
  raw: string;
};

type SerializedEmail = Omit<Email, "date"> & { date: string };

type StorageFile = {
  version: 1;
  emails: Record<string, SerializedEmail[]>;
};

const STORAGE_DIR = path.join(process.cwd(), ".data");
const STORAGE_FILE = path.join(STORAGE_DIR, "mail-storage.json");

function deserializeEmail(email: SerializedEmail): Email {
  return {
    ...email,
    date: new Date(email.date),
  };
}

class MailStorage {
  private importAttempted = false;
  private initPromise: Promise<void> | undefined;

  constructor() {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  private async ensureInitialized() {
    if (!this.initPromise) {
      this.initPromise = this.initialize();
    }
    await this.initPromise;
  }

  private async initialize() {
    await this.maybeImportLegacyJson();
  }

  private async maybeImportLegacyJson() {
    if (this.importAttempted) return;
    this.importAttempted = true;

    try {
      const db = getDb();
      if (!fs.existsSync(STORAGE_FILE)) return;

      const existing = await db
        .select({ c: sql<number>`count(*)` })
        .from(emails);
      if ((existing[0]?.c ?? 0) > 0) return;

      const raw = fs.readFileSync(STORAGE_FILE, "utf8");
      const parsed = JSON.parse(raw) as Partial<StorageFile>;
      if (!parsed || parsed.version !== 1 || !parsed.emails) return;

      const collected: Email[] = [];
      for (const [address, list] of Object.entries(parsed.emails)) {
        if (!Array.isArray(list)) continue;
        for (const item of list) {
          if (!item) continue;
          const email = deserializeEmail(item as SerializedEmail);
          if (!email.id || !email.to) continue;
          collected.push({ ...email, to: address.toLowerCase() });
        }
      }

      if (collected.length > 0) {
        await db
          .insert(emails)
          .values(
            collected.map((e) => ({
              id: e.id,
              recipient: e.to.toLowerCase(),
              sender: e.from,
              subject: e.subject,
              text: e.text,
              html: e.html === false ? null : e.html,
              date: e.date,
              raw: e.raw,
            })),
          )
          .onConflictDoNothing();
        await this.cleanOldUnsafe();
      }
    } catch (error) {
      console.warn("mail-storage: failed to import legacy JSON", error);
    }
  }

  private async cleanOldUnsafe() {
    const db = getDb();
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    try {
      await db.delete(emails).where(lt(emails.date, cutoff));
    } catch (error) {
      console.warn("mail-storage: cleanup failed", error);
    }
  }

  async addEmail(rawEmail: string) {
    await this.ensureInitialized();
    const db = getDb();

    const parsed = await simpleParser(rawEmail);

    const toAddressObj = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
    const toAddress = toAddressObj?.value?.[0]?.address?.toLowerCase() || "";
    if (!toAddress) {
      throw new Error("Missing recipient address (to)");
    }
    const email: Email = {
      id: crypto.randomUUID(),
      to: toAddress,
      from: parsed.from?.value?.[0]?.address || "",
      subject: parsed.subject || "(no subject)",
      text: parsed.text || "",
      html: parsed.html || false,
      date: parsed.date || new Date(),
      raw: rawEmail,
    };

    await db.insert(emails).values({
      id: email.id,
      recipient: email.to,
      sender: email.from,
      subject: email.subject,
      text: email.text,
      html: email.html === false ? null : email.html,
      date: email.date,
      raw: email.raw,
    });

    // 古いメールは自動削除（1時間以上前のもの）
    await this.cleanOldUnsafe();

    return email;
  }

  async getEmailsPage(address: string, page: number, pageSize: number) {
    await this.ensureInitialized();
    const db = getDb();
    const recipient = address.toLowerCase();
    const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize)));
    const safePage = Math.max(1, Math.floor(page));

    const totalRow = await db
      .select({ c: sql<number>`count(*)` })
      .from(emails)
      .where(eq(emails.recipient, recipient));
    const total = totalRow[0]?.c ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const effectivePage = Math.min(safePage, totalPages);
    const effectiveOffset = (effectivePage - 1) * safePageSize;

    const rows = await db
      .select()
      .from(emails)
      .where(eq(emails.recipient, recipient))
      .orderBy(desc(emails.date))
      .limit(safePageSize)
      .offset(effectiveOffset);

    const items: Email[] = rows.map((r) => ({
      id: r.id,
      to: r.recipient,
      from: r.sender,
      subject: r.subject,
      text: r.text,
      html: r.html ?? false,
      date: r.date,
      raw: r.raw,
    }));

    return {
      items,
      total,
      page: effectivePage,
      pageSize: safePageSize,
      totalPages,
    };
  }

  async getEmail(address: string, emailId: string): Promise<Email | undefined> {
    await this.ensureInitialized();
    const db = getDb();
    const recipient = address.toLowerCase();

    const rows = await db
      .select()
      .from(emails)
      .where(and(eq(emails.recipient, recipient), eq(emails.id, emailId)))
      .limit(1);
    const row = rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      to: row.recipient,
      from: row.sender,
      subject: row.subject,
      text: row.text,
      html: row.html ?? false,
      date: row.date,
      raw: row.raw,
    };
  }

  // 全てのメールアドレスから古いメールを削除
  async cleanAll() {
    await this.ensureInitialized();
    await this.cleanOldUnsafe();
  }
}

const globalForMailStorage = globalThis as unknown as {
  __mailStorage?: MailStorage;
  __mailStorageCleanupStarted?: boolean;
};

export const mailStorage =
  globalForMailStorage.__mailStorage ?? new MailStorage();
globalForMailStorage.__mailStorage = mailStorage;

// 定期的にクリーンアップ（5分ごと）: HMRでも多重起動しない
if (!globalForMailStorage.__mailStorageCleanupStarted) {
  globalForMailStorage.__mailStorageCleanupStarted = true;
  setInterval(
    () => {
      void mailStorage.cleanAll();
    },
    5 * 60 * 1000,
  );
}
