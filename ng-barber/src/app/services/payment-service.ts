import { Injectable } from '@angular/core';
import { PaymentModel } from '../common/models/payment.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Account } from '../common/models/account.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  createIncome(payment: PaymentModel): Observable<any> {
    return this.http.post(`api/payment/create/income`, payment);
  }

  searchPayments(page: number, size: number, transactionType: string, status: string, accountId?: number, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('transactionType', transactionType || '')
      .set('status', status || '');

    if (accountId != null) params = params.set('accountId', accountId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`api/payment/search`, { params });
  }

  getPaymentSummary(
    transactionType?: string,
    status?: string,
    inChargeId?: number,
    startDate?: string,
    endDate?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (transactionType) params = params.set('transactionType', transactionType);
    if (status) params = params.set('status', status);
    if (inChargeId != null) params = params.set('inChargeId', inChargeId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>('api/payment/summary', { params });
  }

  getInCharge(): Observable<Account[]> {
    return this.http.get<Account[]>('api/payment/get/inCharge');
  }

  markAsPaid(id: number): Observable<PaymentModel> {
    return this.http.put<PaymentModel>(`api/payment/paid/${id}`, {});
  }


  getPaymentInfoById(id: number): Observable<PaymentModel> {
    return this.http.get<PaymentModel>(`api/payment/get-info/${id}`);
  }

  createOutcome(paymentDto: any): Observable<PaymentModel> {
    return this.http.post<PaymentModel>('api/payment/create/outcome', paymentDto);
  }

  createOutcomeCustom(paymentDto: any): Observable<PaymentModel> {
    return this.http.post<PaymentModel>('api/payment/create/outcome/custom', paymentDto);
  }

}
