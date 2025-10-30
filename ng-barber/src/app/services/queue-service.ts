import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueueModel } from '../common/models/queue.model';
import { Observable } from 'rxjs';
import { Account } from '../common/models/account.model';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  constructor(private http: HttpClient) { }

  createQueue(queue: QueueModel): Observable<QueueModel> {
    return this.http.post<QueueModel>(`api/queue/create`, queue);
  }

  getMyQueue(accountDto: { accountId: number }): Observable<QueueModel> {
    return this.http.post<QueueModel>('api/queue/myQueue', accountDto);
  }

  getPreviousQueueCount(queueDto: { queueNumber: number, barberId: number }): Observable<number> {
    return this.http.post<number>('api/queue/waiting-queues', queueDto);
  }

  getPreviousQueueFromBarber(barberDto: { barberId: number }): Observable<number> {
    return this.http.post<number>('api/queue/barber/waiting-queues', barberDto);
  }

  cancelQueue(queue: QueueModel): Observable<QueueModel> {
    return this.http.put<QueueModel>(`api/queue/cancel`, queue);
  }

  getTodayQueuesForOwner(accountDto: { accountId: number }): Observable<QueueModel[]> {
    return this.http.post<QueueModel[]>('/api/queue/barber/myQueues', accountDto);
  }


  getQueueDetails() {
    return this.http.get<QueueModel>('/api/queue/barber/myQueues')
  }

  getQueueDetailsForBarber(queueId: number) {
    return this.http.get<QueueModel>(`/api/queue/barber/queue-details/${queueId}`);
  }

  getLaterQueueCount(queueId: number): Observable<number> {
    return this.http.get<number>(`/api/queue/queue-later/${queueId}`);
  }

  getQueueInfoForBarber(queueId: number): Observable<Account> {
    return this.http.get<Account>(`/api/queue/barber/queue-info/${queueId}`);
  }

  setQueueCanceled(queueId: number, accountId: number): Observable<QueueModel> {
    return this.http.put<QueueModel>(`api/queue/barber/cancel/${queueId}`, { accountId } );
  }

  setQueueDone(queueId: number, accountId: number): Observable<QueueModel> {
    return this.http.put<QueueModel>(`api/queue/barber/done/${queueId}`, { accountId });
  }

}
