import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Process {
    pid: number;
    name: string;
    username: string;
    cpu_percent: number;
    memory_bytes: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProcessService {
    private apiUrl = 'http://localhost:8000/api/processes';

    constructor(private http: HttpClient) { }

    list(): Observable<Process[]> {
        return this.http.get<Process[]>(`${this.apiUrl}/list`);
    }

    kill(pid: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/kill/${pid}`);
    }
}
