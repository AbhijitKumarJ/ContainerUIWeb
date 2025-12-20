import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSystemService } from '../../../services/file-system.service';
import { FileNode } from '../../../models/file-node.interface';

@Component({
    selector: 'app-file-explorer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="explorer-container">
      <div class="toolbar">
        <div class="breadcrumb">
          <span class="crumb" (click)="navigate([])"><i class="fa-solid fa-server"></i> /</span>
          @for (crumb of currentPath(); track crumb; let i = $index) {
             <span class="separator">></span>
             <span class="crumb" (click)="navigate(currentPath().slice(0, i + 1))">{{ crumb }}</span>
          }
        </div>
      </div>

      <div class="content-area">
        <div class="sidebar">
           <div class="quick-access-item" (click)="navigate(['home', 'user'])">
             <i class="fa-solid fa-house"></i> Home
           </div>
           <div class="quick-access-item" (click)="navigate(['home', 'user', 'documents'])">
              <i class="fa-solid fa-file-lines"></i> Documents
           </div>
           <div class="quick-access-item" (click)="navigate(['var', 'log'])">
              <i class="fa-solid fa-gear"></i> System Logs
           </div>
        </div>
        
        <div class="file-grid">
           @if (loading()) {
             <div class="loading">Loading...</div>
           } @else {
             @if (files().length === 0) {
               <div class="empty-state">This folder is empty.</div>
             }
             @for (file of files(); track file.name) {
               <div class="file-item" (dblclick)="onItemDblClick(file)" [class.selected]="selectedFile() === file" (click)="selectedFile.set(file)">
                 <i class="fa-solid" [ngClass]="file.type === 'folder' ? 'fa-folder icon-folder' : 'fa-file icon-file'"></i>
                 <span class="file-name">{{ file.name }}</span>
               </div>
             }
           }
        </div>
      </div>
    </div>
  `,
    styles: [`
    .explorer-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      color: #e0e0e0;
      font-family: 'Segoe UI', sans-serif;
    }

    .toolbar {
      padding: 8px 12px;
      background: #252526;
      border-bottom: 1px solid #333;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.9rem;
      
      .crumb {
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        &:hover { background: #3e3e42; }
      }
      .separator { color: #888; }
    }

    .content-area {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidebar {
      width: 200px;
      background: #1e1e1e;
      border-right: 1px solid #333;
      padding: 10px 0;

      .quick-access-item {
        padding: 6px 15px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #ccc;
        
        &:hover { background: #2a2d2e; color: white; }
        i { width: 16px; text-align: center; }
      }
    }

    .file-grid {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      grid-auto-rows: min-content;
      gap: 10px;
      background: #1e1e1e;
    }

    .file-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border-radius: 4px;
      cursor: default;
      text-align: center;
      border: 1px solid transparent;

      &:hover { background: #2a2d2e; }
      &.selected { background: #37373d; border-color: #007fd4; }

      i { font-size: 2.5rem; margin-bottom: 8px; }
      .icon-folder { color: #dcb67a; }
      .icon-file { color: #519aba; }
      
      .file-name {
        font-size: 0.85rem;
        word-break: break-word;
        max-width: 100%;
      }
    }
    
    .loading, .empty-state {
        color: #888;
        margin-top: 20px;
        width: 100%;
        text-align: center;
        grid-column: 1 / -1;
    }
  `]
})
export class FileExplorerComponent {
    fs = inject(FileSystemService);

    currentPath = signal<string[]>([]);
    files = signal<FileNode[]>([]);
    loading = signal(false);
    selectedFile = signal<FileNode | null>(null);

    constructor() {
        this.refresh();
    }

    navigate(path: string[]) {
        this.currentPath.set(path);
        this.refresh();
    }

    refresh() {
        this.loading.set(true);
        this.fs.getFiles(this.currentPath()).subscribe(files => {
            this.files.set(files);
            this.loading.set(false);
            this.selectedFile.set(null);
        });
    }

    onItemDblClick(file: FileNode) {
        if (file.type === 'folder') {
            this.navigate([...this.currentPath(), file.name]);
        } else {
            // Open file logic (placeholder)
            console.log('Opening file:', file.name);
        }
    }
}
