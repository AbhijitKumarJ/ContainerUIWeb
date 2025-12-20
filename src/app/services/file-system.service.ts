import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FileNode } from '../models/file-node.interface';

@Injectable({
    providedIn: 'root'
})
export class FileSystemService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8000';

    getFiles(path: string[]): Observable<FileNode[]> {
        let directoryPath = "";
        // We maintain a rootDirectory to reconstruct absolute paths for the backend.
        // If it's the first call (empty path), we expect to learn the root from the backend.
        return new Observable(observer => {
            this._getFilesFromBackend(path).subscribe({
                next: (response) => {
                    observer.next(response);
                    observer.complete();
                },
                error: (err) => {
                    console.error('File system error:', err);
                    observer.error(err);
                }
            })
        });

    }

    private rootDirectory: string | null = null;

    private _getFilesFromBackend(path: string[]): Observable<FileNode[]> {
        let queryPath = "";

        if (path.length > 0 && this.rootDirectory) {
            const separator = this.rootDirectory.endsWith('\\') ? '' : '\\';
            queryPath = this.rootDirectory + separator + path.join('\\');
        }

        return this.http.get<{ files: any[], directory: string }>(`${this.apiUrl}/getfolderstructure`, {
            params: queryPath ? { directory: queryPath } : {}
        }).pipe(
            tap(response => {
                if (!this.rootDirectory) {
                    this.rootDirectory = response.directory;
                }
            }),
            map(response => response.files.map((f: any) => ({
                name: f.name,
                type: f.type,
                size: this.formatSize(f.size),
                modified: new Date(f.modified),
                children: []
            })))
        );
    }

    private formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
