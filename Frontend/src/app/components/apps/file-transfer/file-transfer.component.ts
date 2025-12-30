import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileTransferService } from '../../../services/file-transfer.service';

// Actually, apps usually just have their content. Window wrapper is outer.

@Component({
    selector: 'app-file-transfer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="file-transfer-container">
      <!-- Upload Section -->
      <div class="panel upload-panel">
        <h3><i class="fa-solid fa-cloud-arrow-up"></i> Upload to Container</h3>
        
        <div class="drop-zone" 
             (dragover)="onDragOver($event)" 
             (dragleave)="onDragLeave($event)" 
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          <i class="fa-solid fa-file-import"></i>
          <p>Click or Drag files here to upload</p>
          <input #fileInput type="file" (change)="onFileSelected($event)" hidden>
        </div>

        <div class="file-list">
          <h4>Uploaded Files ({{uploadedFiles.length}})</h4>
          <ul>
            <li *ngFor="let file of uploadedFiles">
              <span class="filename" title="{{file}}">{{file}}</span>
              <button class="action-btn delete-btn" (click)="deleteFile('upload', file)" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </li>
            <li *ngIf="uploadedFiles.length === 0" class="empty-state">No uploaded files yet.</li>
          </ul>
        </div>
      </div>

      <!-- Download Section -->
      <div class="panel download-panel">
        <h3><i class="fa-solid fa-cloud-arrow-down"></i> Download from Container</h3>
        
        <div class="file-list full-height">
          <h4>Available Downloads ({{downloadFiles.length}})</h4>
          <ul>
            <li *ngFor="let file of downloadFiles">
              <span class="filename" title="{{file}}">{{file}}</span>
              <div class="actions">
                <a [href]="getDownloadLink(file)" target="_blank" class="action-btn download-btn" title="Download">
                  <i class="fa-solid fa-download"></i>
                </a>
                <button class="action-btn delete-btn" (click)="deleteFile('download', file)" title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </li>
            <li *ngIf="downloadFiles.length === 0" class="empty-state">No files available for download.</li>
          </ul>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .file-transfer-container {
      display: flex;
      gap: 20px;
      height: 100%;
      padding: 15px;
      box-sizing: border-box;
      background: #1e1e1e;
      color: white;
      font-family: 'Segoe UI', sans-serif;
    }

    .panel {
      flex: 1;
      background: #252526;
      border-radius: 8px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      border: 1px solid #333;
    }

    h3 {
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1rem;
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
      color: #ccc;
    }

    h4 {
      margin: 10px 0;
      font-size: 0.9rem;
      color: #888;
    }

    .drop-zone {
      border: 2px dashed #444;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 15px;
      
      i { font-size: 2rem; color: #555; margin-bottom: 10px; }
      p { margin: 0; color: #888; }

      &:hover, &.drag-over {
        border-color: #0078d4;
        background: rgba(0, 120, 212, 0.1);
        i { color: #0078d4; }
        p { color: #ccc; }
      }
    }

    .file-list {
      flex: 1;
      overflow-y: auto;
      
      &.full-height {
        display: flex;
        flex-direction: column;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px;
        border-bottom: 1px solid #333;
        transition: background 0.1s;

        &:hover {
          background: #2a2d2e;
        }

        .filename {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 10px;
        }

        .actions {
          display: flex;
          gap: 5px;
        }

        .action-btn {
          background: none;
          border: none;
          color: #aaa;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          transition: all 0.2s;

          &:hover {
            background: #3c3c3c;
            color: white;
          }

          &.download-btn:hover { color: #4CAF50; }
          &.delete-btn:hover { color: #f44336; }
        }
      }
      
      .empty-state {
        text-align: center;
        color: #555;
        padding: 20px;
      }
    }
  `]
})
export class FileTransferComponent implements OnInit {
    private fileTransferService = inject(FileTransferService);

    uploadedFiles: string[] = [];
    downloadFiles: string[] = [];

    ngOnInit() {
        this.refreshLists();
    }

    refreshLists() {
        this.fileTransferService.getFiles('upload').subscribe({
            next: (files) => this.uploadedFiles = files,
            error: (err) => console.error('Error fetching uploaded files:', err)
        });

        this.fileTransferService.getFiles('download').subscribe({
            next: (files) => this.downloadFiles = files,
            error: (err) => console.error('Error fetching download files:', err)
        });
    }

    getDownloadLink(filename: string): string {
        return this.fileTransferService.getDownloadUrl(filename);
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.uploadFile(file);
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        (event.currentTarget as HTMLElement).classList.add('drag-over');
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        (event.currentTarget as HTMLElement).classList.remove('drag-over');
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        (event.currentTarget as HTMLElement).classList.remove('drag-over');

        if (event.dataTransfer?.files.length) {
            this.uploadFile(event.dataTransfer.files[0]);
        }
    }

    uploadFile(file: File) {
        this.fileTransferService.uploadFile(file).subscribe({
            next: () => {
                this.refreshLists();
            },
            error: (err) => console.error('Upload failed:', err)
        });
    }

    deleteFile(type: 'upload' | 'download', filename: string) {
        if (confirm(`Are you sure you want to delete ${filename}?`)) {
            this.fileTransferService.deleteFile(type, filename).subscribe({
                next: () => this.refreshLists(),
                error: (err) => console.error('Delete failed:', err)
            });
        }
    }
}
