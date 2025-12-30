import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class FileTransferService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8000/api/file-transfer'; // Should ideally use environment variable, but hardcoding for consistency with other services if they do so.
    // Checking other services, they usually construct URL. Assuming localhost:8000 based on previous context.

    constructor() { }

    uploadFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/upload`, formData);
    }

    getFiles(type: 'upload' | 'download'): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/files/${type}`);
    }

    deleteFile(type: 'upload' | 'download', filename: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/files/${type}/${filename}`);
    }

    getDownloadUrl(filename: string): string {
        return `${this.apiUrl}/download/${filename}`;
    }
}
