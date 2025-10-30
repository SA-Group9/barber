export interface QueueModel {
  queueId?: number;
  queueNumber?: number;
  dateTime?: string;
  status?: string;
  accountId?: number;
  barberId?: number;
  serviceId?: number;
  latestEdit?: string;
  editedBy?: number;
}