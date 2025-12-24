declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(filename: string, options?: any);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }

  export class StatementSync {
    run(...args: any[]): any;
    get<T = any>(...args: any[]): T | undefined;
    all<T = any>(...args: any[]): T[];
  }
}
