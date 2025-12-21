import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSystemService } from '../../../services/file-system.service';
import { FileNode } from '../../../models/file-node.interface';
import { WindowManagerService } from '../../../services/window-manager.service';
import { TextEditorComponent } from '../text-editor/text-editor.component';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="explorer-container">
      <div class="toolbar">
        <div class="actions">
            <button class="tool-btn" title="New File" (click)="onCreate('file')">
                <i class="fa-solid fa-file-circle-plus"></i>
            </button>
            <button class="tool-btn" title="New Folder" (click)="onCreate('folder')">
                <i class="fa-solid fa-folder-plus"></i>
            </button>
            <button class="tool-btn" title="Paste" [disabled]="!clipboard()" (click)="onPaste()">
                <i class="fa-solid fa-paste"></i>
            </button>
            <span class="divider">|</span>
        </div>
        <div class="breadcrumb">
          <span class="crumb" (click)="navigate([])"><i class="fa-solid fa-server"></i> /</span>
          @for (crumb of currentPath(); track crumb; let i = $index) {
             <span class="separator">></span>
             <span class="crumb" (click)="navigate(currentPath().slice(0, i + 1))">{{ crumb }}</span>
          }
        </div>
      </div>

      <div class="content-area">
        
        <div class="main-view">
            <div class="file-grid" (click)="onGridClick($event)">
            @if (loading()) {
                <div class="loading">Loading...</div>
            } @else {
                @if (files().length === 0) {
                <div class="empty-state">This folder is empty.</div>
                }
                @for (file of files(); track file.name) {
                <div class="file-item" 
                    (dblclick)="onItemDblClick(file)" 
                    [class.selected]="selectedFile()?.name === file.name" 
                    (click)="onItemClick(file, $event)">
                    <i class="fa-solid" [ngClass]="file.type === 'folder' ? 'fa-folder icon-folder' : 'fa-file icon-file'"></i>
                    <span class="file-name">{{ file.name }}</span>
                </div>
                }
            }
            </div>

            @if (selectedFile(); as file) {
            <div class="properties-panel">
                <div class="prop-header">
                    <i class="fa-solid" [ngClass]="file.type === 'folder' ? 'fa-folder icon-folder' : 'fa-file icon-file'"></i>
                    <span class="prop-title">{{ file.name }}</span>
                </div>
                
                <div class="prop-details">
                    @if (selectedFileProperties(); as props) {
                        <div class="prop-row">
                            <span class="label">Type:</span>
                            <span class="value">{{ props.type }}</span>
                        </div>
                         <div class="prop-row">
                            <span class="label">Size:</span>
                            <span class="value">{{ props.size }} bytes</span>
                        </div>
                        <div class="prop-row">
                            <span class="label">Modified:</span>
                            <span class="value">{{ props.modified | date:'medium' }}</span>
                        </div>
                        <div class="prop-row">
                            <span class="label">Location:</span>
                            <span class="value">{{ props.parent }}</span>
                        </div>
                        
                        <div class="actions">
                            <span class="action-label">Actions:</span>
                            <div class="action-buttons">
                                <button class="btn-action" (click)="onCopy()" title="Copy">
                                    <i class="fa-solid fa-copy"></i>
                                </button>
                                <button class="btn-action" (click)="onCut()" title="Cut">
                                    <i class="fa-solid fa-scissors"></i>
                                </button>
                                <button class="btn-action delete" (click)="onDelete()" title="Delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        @if (file.type === 'file') {
                            <div class="actions mt-2">
                                <span class="action-label">Open with:</span>
                                <button class="btn-open" (click)="openWith('Text Editor')">
                                    <i class="fa-solid fa-pen-to-square"></i> Text Editor
                                </button>
                            </div>
                        }
                    } @else {
                        <div class="loading-props">Loading properties...</div>
                    }
                </div>
            </div>
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
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .toolbar .actions {
        display: flex;
        gap: 5px;
        align-items: center;
    }
    
    .tool-btn {
        background: transparent;
        border: none;
        color: #ccc;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        
        &:hover:not(:disabled) { background: #3e3e42; color: white; }
        &:disabled { opacity: 0.5; cursor: default; }
        i { font-size: 1rem; }
    }
    
    .divider { color: #555; margin: 0 5px; }

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

    
    .main-view {
        flex: 1;
        display: flex;
        overflow: hidden;
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
    
    .properties-panel {
        width: 250px;
        background: #252526;
        border-left: 1px solid #333;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        
        .prop-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
            text-align: center;
            
            i { font-size: 3rem; margin-bottom: 10px; }
            .icon-folder { color: #dcb67a; }
            .icon-file { color: #519aba; }
            
            .prop-title {
                font-weight: bold;
                font-size: 1rem;
                word-break: break-word;
            }
        }
        
        .prop-details {
            font-size: 0.9rem;
            
            .prop-row {
                margin-bottom: 12px;
                display: flex;
                flex-direction: column;
                
                .label { color: #888; font-size: 0.8rem; margin-bottom: 2px; }
                .value { color: #ccc; word-break: break-all; }
            }
        }
        
        .actions {
            margin-top: 20px;
            border-top: 1px solid #3d3d3d;
            padding-top: 15px;
            
            .action-label {
                display: block;
                color: #888;
                font-size: 0.85rem;
                margin-bottom: 10px;
            }
            
            .action-buttons {
                display: flex;
                gap: 5px;
                margin-bottom: 10px;
            }
            
            .btn-action {
                flex: 1;
                background: #3c3c3c;
                border: 1px solid #454545;
                color: #ccc;
                padding: 6px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                
                &:hover { background: #4b4b4b; color: white; }
                
                &.delete:hover { background: #a42e2e; border-color: #a42e2e; }
            }

            .btn-open {
                width: 100%;
                background: #3c3c3c;
                border: 1px solid #454545;
                color: white;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                justify-content: center;
                font-size: 0.9rem;
                
                &:hover { background: #4b4b4b; }
                i { font-size: 0.9rem; }
            }
            
            .mt-2 { margin-top: 15px; }
        }
    }
    
    .loading, .empty-state, .loading-props {
        color: #888;
        margin-top: 20px;
        width: 100%;
        text-align: center;
    }
  `]
})
export class FileExplorerComponent {
  fs = inject(FileSystemService);

  currentPath = signal<string[]>([]);
  files = signal<FileNode[]>([]);
  loading = signal(false);

  selectedFile = signal<FileNode | null>(null);
  selectedFileProperties = signal<any>(null);
  clipboard = signal<{ path: string, op: 'copy' | 'cut' } | null>(null);

  constructor() {
    this.refresh();
  }

  navigate(path: string[]) {
    this.currentPath.set(path);
    this.selectedFile.set(null); // Deselect on navigate
    this.selectedFileProperties.set(null);
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.fs.getFiles(this.currentPath()).subscribe(files => {
      this.files.set(files);
      this.loading.set(false);
    });
  }

  onItemDblClick(file: FileNode) {
    if (file.type === 'folder') {
      this.navigate([...this.currentPath(), file.name]);
    } else {
      this.onItemClick(file, new MouseEvent('click'));
    }
  }

  onItemClick(file: FileNode, event: MouseEvent) {
    event.stopPropagation();

    if (this.selectedFile()?.name === file.name) return;

    this.selectedFile.set(file);
    this.selectedFileProperties.set(null);

    this.fs.getFileProperties(this.currentPath(), file.name, file.type).subscribe({
      next: (props) => {
        this.selectedFileProperties.set(props);
      },
      error: (err) => {
        console.error("Failed to load properties", err);
        this.selectedFileProperties.set({ error: "Failed to load properties" });
      }
    });
  }

  onGridClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.selectedFile.set(null);
      this.selectedFileProperties.set(null);
    }
  }

  onCreate(type: 'file' | 'folder') {
    const name = prompt(`Enter name for new ${type}:`, type === 'file' ? 'New Text Document.txt' : 'New Folder');
    if (name) {
      this.fs.createItem(this.currentPath(), name, type).subscribe(() => this.refresh());
    }
  }

  onCopy() {
    const props = this.selectedFileProperties();
    if (props && props.path) {
      this.clipboard.set({ path: props.path, op: 'copy' });
    }
  }

  onCut() {
    const props = this.selectedFileProperties();
    if (props && props.path) {
      this.clipboard.set({ path: props.path, op: 'cut' });
    }
  }

  onPaste() {
    const clip = this.clipboard();
    if (!clip) return;

    // We rely on getFileProperties logic to find the destination path
    this.fs.getFileProperties(this.currentPath(), '', 'folder').subscribe({
      next: (props) => {
        // If successful, props.path is the directory path
        const destDir = props.path;
        if (!destDir) return;

        // Construct destination file path
        let fileName = clip.path.split(/[/\\]/).pop();
        if (!fileName) fileName = 'item'; // Fallback

        // Simple separator check
        const separator = (destDir.endsWith('\\') || destDir.endsWith('/')) ? '' : '\\';
        const destPath = destDir + separator + fileName;

        if (clip.op === 'copy') {
          this.fs.copyItem(clip.path, destPath).subscribe(() => this.refresh());
        } else {
          this.fs.moveItem(clip.path, destPath).subscribe(() => {
            this.clipboard.set(null);
            this.refresh();
          });
        }
      },
      error: (err) => {
        console.error("Could not resolve current directory path for paste", err);
      }
    });
  }

  onDelete() {
    const file = this.selectedFile();
    if (!file) return;
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      this.fs.deleteItem(this.currentPath(), file.name).subscribe(() => {
        this.selectedFile.set(null);
        this.selectedFileProperties.set(null);
        this.refresh();
      });
    }
  }

  wm = inject(WindowManagerService);

  openWith(appName: string) {
    const file = this.selectedFile();
    if (!file) return;

    console.log(`Opening ${file.name} with ${appName}`);

    if (appName === 'Text Editor') {
      this.wm.openApp(
        'text-editor-' + crypto.randomUUID(),
        TextEditorComponent,
        file.name,
        'fa-solid fa-file-pen',
        {
          initialFileName: file.name,
          currentPath: this.currentPath()
        }
      );
    }
  }
}
