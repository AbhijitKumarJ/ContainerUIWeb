
import { Component, Input, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileSystemService } from '../../../services/file-system.service';
import { WindowManagerService } from '../../../services/window-manager.service';

@Component({
    selector: 'app-extension-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="extension-frame-wrapper">
      <iframe 
        #extFrame 
        [src]="safeUrl" 
        frameborder="0" 
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups">
      </iframe>
    </div>
  `,
    styles: [`
    .extension-frame-wrapper { width: 100%; height: 100%; display: flex; flex-direction: column; }
    iframe { width: 100%; height: 100%; border: none; background: white; flex: 1; }
  `]
})
export class ExtensionLoaderComponent implements OnInit, OnDestroy {
    @Input() url!: string;
    @Input() extId!: string;

    @ViewChild('extFrame') extFrame!: ElementRef<HTMLIFrameElement>;

    safeUrl!: SafeResourceUrl;
    sanitizer = inject(DomSanitizer);
    fs = inject(FileSystemService);
    wm = inject(WindowManagerService);

    private messageListener: any;

    ngOnInit() {
        // Determine the full URL. If it starts with http, use it, otherwise prepend backend url
        // For now assuming the backend serves it on same host or we use a proxy, 
        // but clearly in the plan we mounted it on valid backend port.
        // However, the iframe needs a full URL or absolute path. 
        // If the backend runs on 8000 and angular on 4200, we need full http://localhost:8000/extensions/...
        // Let's hardcode the base for now or assume it's passed in full.
        // The backend `list_extensions` returns `/extensions/...`.
        const backendBase = 'http://localhost:8000'; // Helper assumption
        const fullUrl = this.url.startsWith('http') ? this.url : `${backendBase}${this.url}`;

        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);

        this.messageListener = this.handleMessage.bind(this);
        window.addEventListener('message', this.messageListener);
    }

    ngOnDestroy() {
        if (this.messageListener) {
            window.removeEventListener('message', this.messageListener);
        }
    }

    handleMessage(event: MessageEvent) {
        const data = event.data;
        if (!data || data.target !== 'OS_HOST') return;

        // We can check event.origin to be sure it's from our backend, 
        // but for localhost dev it might vary.

        if (data.action === 'READ_FILE') {
            const { path, filename } = data.payload || data;
            let pathArr = this._parsePath(path);

            this.fs.readFile(pathArr, filename).subscribe({
                next: (res) => {
                    this.sendReply(data.requestId || data.reqId, { content: res.content });
                },
                error: (err) => {
                    this.sendReply(data.requestId || data.reqId, { error: err.message });
                }
            });
        }

        if (data.action === 'WRITE_FILE') {
            const { path, filename, content } = data.payload || data;
            let pathArr = this._parsePath(path);

            this.fs.writeFile(pathArr, filename, content).subscribe({
                next: (res) => {
                    this.sendReply(data.requestId || data.reqId, { success: true });
                },
                error: (err) => {
                    this.sendReply(data.requestId || data.reqId, { error: err.message });
                }
            });
        }

        if (data.action === 'PICK_FILE') {
            const options = data.payload || {};
            this.wm.openFileDialog({
                mode: options.mode || 'open',
                filters: options.filters,
                defaultFileName: options.defaultFileName
            }).then(result => {
                if (result) {
                    this.sendReply(data.requestId || data.reqId, {
                        success: true,
                        path: result.path,
                        filename: result.fileName,
                        fullPath: [...result.path, result.fileName].join('/') // Helper
                    });
                } else {
                    this.sendReply(data.requestId || data.reqId, { cancelled: true });
                }
            });
        }
    }

    private _parsePath(path: any): string[] {
        if (Array.isArray(path)) {
            return path;
        } else if (typeof path === 'string') {
            return path.split('/').filter(p => p.length > 0);
        }
        return [];
    }

    sendReply(requestId: string, result: any) {
        if (!this.extFrame?.nativeElement?.contentWindow) return;

        this.extFrame.nativeElement.contentWindow.postMessage({
            requestId: requestId,
            reqId: requestId, // Support both
            result: result,
            content: result.content // For legacy support if needed
        }, '*');
    }
}
