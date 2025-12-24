import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const emails = pgTable(
  "emails",
  {
    id: uuid("id").primaryKey(),
    recipient: text("recipient").notNull(),
    sender: text("sender").notNull(),
    subject: text("subject").notNull(),
    text: text("text").notNull(),
    html: text("html"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    raw: text("raw").notNull(),
  },
  (t) => ({
    recipientDateIdx: index("idx_emails_recipient_date").on(
      t.recipient,
      t.date,
    ),
  }),
);

export type EmailRow = typeof emails.$inferSelect;
export type NewEmailRow = typeof emails.$inferInsert;
