export interface PaymentModel {
  paymentId?: number;
  transactionType?: string;
//   paymentMethod?: string;
  amount?: number;
  serviceId?: number;
  dateTime?: string;
  editedAt?: string;
  accountId?: number;
  queueListId?: number;
  status?: string;
  note?: string;
}
