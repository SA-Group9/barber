import { HttpClient, HttpParams } from '@angular/common/http';
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
    return this.http.put<QueueModel>(`api/queue/barber/cancel/${queueId}`, { accountId });
  }

  setQueueDone(queueId: number, accountId: number): Observable<QueueModel> {
    return this.http.put<QueueModel>(`api/queue/barber/done/${queueId}`, { accountId });
  }

  searchQueues(
    page: number,
    size: number,
    barberId?: number,
    serviceId?: number,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (barberId != null) params = params.set('barberId', barberId.toString());
    if (serviceId != null) params = params.set('serviceId', serviceId.toString());
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get('api/queue/get/queue-log', { params });
  }

  getCustomerNameList(): Observable<any[]> {
    return this.http.get<any[]>('/api/queue/get/customerNameList');
  }

  getEditedByList(): Observable<any[]> {
    return this.http.get<any[]>('/api/queue/get/editedByList');
  }


}
