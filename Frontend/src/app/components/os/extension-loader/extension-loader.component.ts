
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
        (load)="onFrameLoad()"
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
    @Input() initialFileName?: string;
    @Input() currentPath?: string[];

    @ViewChild('extFrame') extFrame!: ElementRef<HTMLIFrameElement>;

    safeUrl!: SafeResourceUrl;
    sanitizer = inject(DomSanitizer);
    fs = inject(FileSystemService);
    wm = inject(WindowManagerService);

    private messageListener: any;
    private frameLoaded = false;

    ngOnInit() {
        console.log('ExtensionLoader Init. Inputs:', {
            url: this.url,
            id: this.extId,
            file: this.initialFileName,
            path: this.currentPath
        });

        const backendBase = 'http://localhost:8000';
        const fullUrl = this.url.startsWith('http') ? this.url : `${backendBase}${this.url}`;

        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);

        this.messageListener = this.handleMessage.bind(this);
        window.addEventListener('message', this.messageListener);
    }

    // Listen for iframe load to send initial file
    onFrameLoad() {
        console.log('ExtensionLoader Iframe Loaded');
        this.frameLoaded = true;
        if (this.initialFileName && this.currentPath) {
            console.log('Sending initial file to extension');
            // Small delay to ensure inner scripts are ready
            setTimeout(() => {
                this.openFile(this.currentPath!, this.initialFileName!);
            }, 500);
        }
    }

    openFile(path: string[], filename: string) {
        // Send message to extension to read/open this file
        // The extension (e.g. Monaco) must listen for 'OPEN_FILE' or similar
        // We'll trust the extension protocol.
        // Assuming standard protocol: { action: 'OPEN_FILE', payload: { path, filename } }
        this.sendToExtension({
            action: 'OPEN_FILE',
            payload: {
                path: path,
                filename: filename
            }
        });
    }

    sendToExtension(message: any) {
        if (!this.extFrame?.nativeElement?.contentWindow) return;
        this.extFrame.nativeElement.contentWindow.postMessage(message, '*');
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
