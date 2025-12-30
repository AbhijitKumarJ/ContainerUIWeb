import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceInfo {
    name: string;
    display_name: string;
    status: 'running' | 'stopped' | 'paused' | 'unknown';
}

@Injectable({
    providedIn: 'root'
})
export class ServiceManagerService {
    private apiUrl = 'http://localhost:8000/api/services';

    constructor(private http: HttpClient) { }

    list(): Observable<ServiceInfo[]> {
        return this.http.get<ServiceInfo[]>(`${this.apiUrl}/list`);
    }

    start(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/start/${name}`, {});
    }

    stop(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/stop/${name}`, {});
    }

    restart(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/restart/${name}`, {});
    }
}
