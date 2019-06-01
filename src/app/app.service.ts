import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class AppService {
    public httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'my-auth-token'
        })
    };

    constructor(private httpClient: HttpClient) { }

    public getRequest(api: string): Observable<any> {
        return this.httpClient.get<any>(api).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public postRequest(api: string, body: any): Observable<any> {
        return this.httpClient.post<any>(api, body, this.httpOptions).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public deleteRequest(api: string): Observable<any> {
        return this.httpClient.delete<any>(api, this.httpOptions).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public putRequest(api: string, body: any): Observable<any> {
        return this.httpClient.put<any>(api, body, this.httpOptions).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public handleError(response: HttpErrorResponse) {
        if (response.error instanceof ErrorEvent) {
            console.log('Client-side or network error occurred: ' + response.error.message);
        } else {
            console.log('Server error occurred. Status Code: ' + response.status + '\nMessage:\n' + response.error);
        }
        return throwError('Something went wrong! Please try later.');
    }
}

