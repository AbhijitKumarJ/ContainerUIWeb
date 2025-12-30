import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BackupService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8000/api/backup';

    exportData(userData: any): Observable<{ filename: string, message: string }> {
        return this.http.post<{ filename: string, message: string }>(`${this.apiUrl}/export`, { user_data: userData });
    }

    importData(file: File): Observable<{ user_data: any, message: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ user_data: any, message: string }>(`${this.apiUrl}/import`, formData);
    }
}
