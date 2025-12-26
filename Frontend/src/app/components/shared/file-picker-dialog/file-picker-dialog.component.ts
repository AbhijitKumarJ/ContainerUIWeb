import { Component, inject, signal, input, output, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSystemService } from '../../../services/file-system.service';
import { FileNode } from '../../../models/file-node.interface';

export interface FileDialogResult {
    path: string[];
    fileName: string;
    fullPath?: string; // Helper for easier usage
}

@Component({
    selector: 'app-file-picker-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="dialog-container">
      <!-- Toolbar / Navigation -->
      <div class="toolbar">
        <button class="nav-btn" (click)="goUp()" [disabled]="currentPath().length === 0">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
        <div class="path-display">
            <span (click)="navigate([])" class="path-crumb"><i class="fa-solid fa-server"></i></span>
            @for (part of currentPath(); track $index) {
                <span class="separator">/</span>
                <span (click)="navigateToIndex($index)" class="path-crumb">{{part}}</span>
            }
        </div>
        <button class="refresh-btn" (click)="refresh()">
            <i class="fa-solid fa-rotate-right"></i>
        </button>
      </div>

      <!-- File List -->
      <div class="file-list-container">
        @if (loading()) {
            <div class="loading">Loading...</div>
        } @else {
            <div class="file-list">
                <!-- Folders first -->
                @for (file of files(); track file.name) {
                    <div class="file-item" 
                         [class.selected]="selectedFile()?.name === file.name"
                         (click)="selectFile(file)"
                         (dblclick)="onItemDblClick(file)"
                         >
                        <i class="fa-solid" [ngClass]="file.type === 'folder' ? 'fa-folder icon-folder' : 'fa-file icon-file'"></i>
                        <span class="name">{{file.name}}</span>
                    </div>
                }
                @if (files().length === 0) {
                    <div class="empty">Folder is empty</div>
                }
            </div>
        }
      </div>

      <!-- Bottom Bar -->
      <div class="bottom-bar">
        <div class="input-group">
            <label>File name:</label>
            <input type="text" [(ngModel)]="fileNameInput" (keyup.enter)="confirm()">
        </div>
        <div class="input-group">
            <label>Type:</label>
            <select disabled>
                <option>All Files (*.*)</option>
            </select>
        </div>
        
        <div class="buttons">
            <button (click)="confirm()">{{ mode() === 'save' ? 'Save' : 'Open' }}</button>
            <button (click)="onCancel()">Cancel</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f0f0f0;
      color: #333;
      font-family: 'Segoe UI', sans-serif;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      padding: 10px;
      background: white;
      border-bottom: 1px solid #ccc;
      align-items: center;
    }

    .nav-btn, .refresh-btn {
      border: 1px solid #ccc;
      background: #f9f9f9;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      &:hover { background: #e0e0e0; }
      &:disabled { opacity: 0.5; cursor: default; }
    }

    .path-display {
      flex: 1;
      border: 1px solid #ccc;
      padding: 4px 8px;
      background: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      overflow: hidden;
      white-space: nowrap;
    }

    .path-crumb {
        cursor: pointer;
        padding: 0 4px;
        &:hover { background: #eee; border-radius: 2px; }
    }
    .separator { color: #888; }

    .file-list-container {
      flex: 1;
      overflow-y: auto;
      background: white;
      margin: 10px;
      border: 1px solid #ccc;
    }

    .file-list {
        display: flex;
        flex-direction: column;
    }

    .file-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px 10px;
        cursor: pointer;
        
        &:hover { background: #e8f0fe; }
        &.selected { background: #cce8ff; border: 1px solid #99d1ff; padding: 4px 9px; } 

        .icon-folder { color: #dcb67a; }
        .icon-file { color: #555; }
    }

    .bottom-bar {
        padding: 10px;
        background: #f0f0f0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-top: 1px solid #ccc;
    }

    .input-group {
        display: flex;
        align-items: center;
        gap: 10px;
        
        label { width: 70px; text-align: right; font-size: 0.9em; }
        input, select { flex: 1; padding: 4px; border: 1px solid #ccc; border-radius: 3px; }
    }

    .buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 5px;

        button {
            padding: 6px 20px;
            cursor: pointer;
            border: 1px solid #aaa;
            border-radius: 4px;
            min-width: 80px;

            &:first-child { /* Primary button */
                background: #0078d4;
                color: white;
                border-color: #005a9e;
                &:hover { background: #106ebe; }
            }
            
            &:last-child { /* Cancel */
                background: white;
                &:hover { background: #f0f0f0; }
            }
        }
    }
    
    .loading, .empty { padding: 20px; text-align: center; color: #888; }
  `]
})
export class FilePickerDialogComponent {
    // Inputs
    mode = input<'open' | 'save'>('open');
    filters = input<string[]>([]); // ['.txt', '.js']
    initialPath = input<string[]>([]);
    defaultFileName = input<string>('');

    // Context for WindowManager interaction
    context = input<{ confirm: (res: FileDialogResult) => void, cancel: () => void } | null>(null);

    // Outputs
    fileSelected = output<FileDialogResult>();
    cancel = output<void>();

    // State
    fs = inject(FileSystemService);

    currentPath = signal<string[]>([]);
    files = signal<FileNode[]>([]);
    loading = signal(false);

    selectedFile = signal<FileNode | null>(null);
    fileNameInput = '';

    constructor() {
        effect(() => {
            if (this.defaultFileName()) {
                this.fileNameInput = this.defaultFileName();
            }
        });
    }

    ngOnInit() {
        if (this.initialPath().length > 0) {
            this.currentPath.set(this.initialPath());
        }
        this.refresh();
    }

    refresh() {
        this.loading.set(true);
        this.fs.getFiles(this.currentPath()).subscribe({
            next: (files) => {
                // Apply filtering? 
                // For now simple sort: folders first
                const sorted = files.sort((a, b) => {
                    if (a.type === b.type) return a.name.localeCompare(b.name);
                    return a.type === 'folder' ? -1 : 1;
                });
                this.files.set(sorted);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
        this.selectedFile.set(null);
        // Keep fileNameInput if mode is save, otherwise clear if open?
        if (this.mode() === 'open') {
            this.fileNameInput = '';
        }
    }

    navigate(path: string[]) {
        this.currentPath.set(path);
        this.refresh();
    }

    navigateToIndex(index: number) {
        this.navigate(this.currentPath().slice(0, index + 1));
    }

    goUp() {
        if (this.currentPath().length > 0) {
            this.navigate(this.currentPath().slice(0, -1));
        }
    }

    selectFile(file: FileNode) {
        this.selectedFile.set(file);
        if (file.type === 'file') {
            this.fileNameInput = file.name;
        }
    }

    onItemDblClick(file: FileNode) {
        if (file.type === 'folder') {
            this.navigate([...this.currentPath(), file.name]);
        } else {
            // Select and confirm
            this.selectFile(file);
            this.confirm();
        }
    }

    confirm() {
        // Validate
        if (!this.fileNameInput) return;

        const result: FileDialogResult = {
            path: this.currentPath(),
            fileName: this.fileNameInput
        };

        const ctx = this.context();
        if (ctx) {
            ctx.confirm(result);
        } else {
            this.fileSelected.emit(result);
        }
    }

    onCancel() {
        const ctx = this.context();
        if (ctx) {
            ctx.cancel();
        } else {
            this.cancel.emit();
        }
    }
}
