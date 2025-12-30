import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
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

    public getFullPath(path: string[]): string {
        if (!this.rootDirectory) return "";
        const separator = this.rootDirectory.endsWith('\\') ? '' : '\\';
        return this.rootDirectory + separator + path.join('\\');
    }

    private ensureRoot(): Observable<void> {
        if (this.rootDirectory) return of(void 0);
        return this._getFilesFromBackend([]).pipe(map(() => void 0));
    }

    private _getFilesFromBackend(path: string[]): Observable<FileNode[]> {
        let queryPath = "";

        if (path.length > 0 && this.rootDirectory) {
            queryPath = this.getFullPath(path);
        }

        // Updated API path
        return this.http.get<{ files: any[], directory: string }>(`${this.apiUrl}/api/filesystem/getfolderstructure`, {
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

    getFileProperties(path: string[], fileName: string, type: 'file' | 'folder'): Observable<any> {
        return this.ensureRoot().pipe(
            switchMap(() => {
                const fullPath = this.getFullPath([...path, fileName]);
                return this.http.get<any>(`${this.apiUrl}/api/filesystem/getfileproperties`, {
                    params: { path: fullPath, type: type }
                });
            })
        );
    }

    readFile(path: string[], fileName: string): Observable<{ content: string }> {
        return this.ensureRoot().pipe(
            switchMap(() => {
                const fullPath = this.getFullPath([...path, fileName]);
                return this.http.get<{ content: string }>(`${this.apiUrl}/api/filesystem/readfile`, {
                    params: { path: fullPath }
                });
            })
        );
    }

    writeFile(path: string[], fileName: string, content: string): Observable<any> {
        return this.ensureRoot().pipe(
            switchMap(() => {
                const fullPath = this.getFullPath([...path, fileName]);
                return this.http.post<any>(`${this.apiUrl}/api/filesystem/writefile`, {
                    path: fullPath,
                    content: content
                });
            })
        );
    }

    createItem(path: string[], name: string, type: 'file' | 'folder'): Observable<any> {
        return this.ensureRoot().pipe(
            switchMap(() => {
                const fullPath = this.getFullPath([...path, name]);
                return this.http.post<any>(`${this.apiUrl}/api/filesystem/create`, {
                    path: fullPath,
                    type: type
                });
            })
        );
    }

    deleteItem(path: string[], fileName: string): Observable<any> {
        return this.ensureRoot().pipe(
            switchMap(() => {
                const fullPath = this.getFullPath([...path, fileName]);
                return this.http.delete<any>(`${this.apiUrl}/api/filesystem/delete`, {
                    params: { path: fullPath }
                });
            })
        );
    }

    copyItem(sourcePath: string, destPath: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/filesystem/copy`, {
            source: sourcePath,
            destination: destPath
        });
    }

    moveItem(sourcePath: string, destPath: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/filesystem/move`, {
            source: sourcePath,
            destination: destPath
        });
    }

    saveImage(path: string, base64Data: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/filesystem/save_image`, {
            path: path,
            image_data: base64Data
        });
    }

    compressItem(path: string[]): Observable<any> {
        return this.ensureRoot().pipe(
            switchMap(() => {
                const fullPath = this.getFullPath(path);
                return this.http.post<any>(`${this.apiUrl}/api/filesystem/compress`, {
                    path: fullPath
                });
            })
        );
    }

    decompressItem(path: string[]): Observable<any> {
        return this.ensureRoot().pipe(
            switchMap(() => {
                const fullPath = this.getFullPath(path);
                return this.http.post<any>(`${this.apiUrl}/api/filesystem/decompress`, {
                    path: fullPath
                });
            })
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
