export interface Account {
  accountId?: number;
  firstName: string;
  lastName: string;
  telNumber: string;
  password: string;
  queuing: boolean;
  role?: string;
}