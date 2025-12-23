import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TerminalResponse {
    output: string;
    error?: string;
    cwd?: string;
    exit_code?: number;
}

export interface CdResponse {
    success: boolean;
    cwd?: string;
    error?: string;
}

export interface InitResponse {
    cwd: string;
    os_type?: string;
    path_sep?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TerminalService {
    private apiUrl = 'http://localhost:8000/api/terminal';

    constructor(private http: HttpClient) { }

    init(): Observable<InitResponse> {
        return this.http.get<InitResponse>(`${this.apiUrl}/init`);
    }

    changeDirectory(targetPath: string, currentCwd: string): Observable<CdResponse> {
        return this.http.post<CdResponse>(`${this.apiUrl}/cd`, {
            target_path: targetPath,
            current_cwd: currentCwd
        });
    }

    executeCommand(command: string, cwd: string): Observable<TerminalResponse> {
        return this.http.post<TerminalResponse>(`${this.apiUrl}/execute_command`, {
            command: command,
            cwd: cwd
        });
    }
}
