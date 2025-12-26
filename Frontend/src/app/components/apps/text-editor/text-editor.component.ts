import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSystemService } from '../../../services/file-system.service';
import { WindowManagerService } from '../../../services/window-manager.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <div class="toolbar">
        <button class="tool-btn" (click)="open()"><i class="fa-solid fa-folder-open"></i> Open</button>
        <button class="tool-btn" (click)="save()"><i class="fa-solid fa-floppy-disk"></i> Save</button>
        <button class="tool-btn" (click)="saveAs()"><i class="fa-solid fa-file-export"></i> Save As</button>
        <span class="filename">{{ fileName() }}</span>
      </div>
      <textarea [(ngModel)]="content" spellcheck="false"></textarea>
      <div class="status-bar">
        Ln {{ getLines() }}, Col {{ getChars() }}
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .toolbar {
      background: #333333;
      padding: 5px 10px;
      display: flex;
      gap: 10px;
      align-items: center;
      border-bottom: 1px solid #444;

      .tool-btn {
        background: transparent;
        border: none;
        color: #ccc;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 4px 8px;
        border-radius: 4px;
        
        &:hover { background: #444; color: white; }
      }

      .filename {
        color: #888;
        font-size: 0.85rem;
        margin-left: auto;
      }
    }

    textarea {
      flex: 1;
      background: #1e1e1e;
      color: #d4d4d4;
      border: none;
      resize: none;
      padding: 10px;
      font-family: 'Consolas', 'Courier New', monospace;
      outline: none;
      font-size: 14px;
      line-height: 1.5;
    }

    .status-bar {
      background: #007acc;
      color: white;
      padding: 2px 10px;
      font-size: 0.75rem;
      text-align: right;
    }
  `]
})
export class TextEditorComponent {
  @Input() initialContent = '';
  @Input() initialFileName = 'Untitled.txt';
  @Input() currentPath: string[] | null = null; // Can be null if new file

  private fs = inject(FileSystemService);
  private wm = inject(WindowManagerService);

  content = '';
  fileName = signal('Untitled.txt');
  activePath = signal<string[] | null>(null);

  ngOnInit() {
    this.fileName.set(this.initialFileName);
    this.activePath.set(this.currentPath);

    // If content is provided explicitly, use it.
    if (this.initialContent) {
      this.content = this.initialContent;
    }
    // Otherwise, if we have a path/filename context, try to read from FS
    else if (this.activePath() && this.initialFileName && this.initialFileName !== 'Untitled.txt') {
      this.loadFile();
    }
  }

  loadFile() {
    const path = this.activePath();
    if (!path) return;

    this.fs.readFile(path, this.fileName()).subscribe({
      next: (res: { content: string }) => {
        this.content = res.content;
      },
      error: (err: any) => {
        console.error('Failed to load file:', err);
        this.content = 'Error loading file content.';
      }
    });
  }

  async open() {
    const result = await this.wm.openFileDialog({
      mode: 'open',
      initialPath: this.activePath() || []
    });

    if (result) {
      this.activePath.set(result.path);
      this.fileName.set(result.fileName);
      this.loadFile();
    }
  }

  save() {
    if (this.activePath() && this.fileName() !== 'Untitled.txt') {
      this.fs.writeFile(this.activePath()!, this.fileName(), this.content).subscribe({
        next: () => {
          console.log('File saved successfully');
          alert(`File "${this.fileName()}" saved!`);
        },
        error: (err) => {
          console.error('Failed to save file:', err);
          alert('Failed to save file.');
        }
      });
    } else {
      this.saveAs();
    }
  }

  async saveAs() {
    const result = await this.wm.openFileDialog({
      mode: 'save',
      initialPath: this.activePath() || [],
      defaultFileName: this.fileName()
    });

    if (result) {
      // Write the file
      this.fs.writeFile(result.path, result.fileName, this.content).subscribe({
        next: () => {
          this.activePath.set(result.path);
          this.fileName.set(result.fileName);
          alert(`File saved to ${result.fileName}`);
        },
        error: (err) => {
          console.error('Failed to save file', err);
          alert('Error saving file');
        }
      });
    }
  }

  getLines() {
    return this.content.split('\n').length;
  }

  getChars() {
    return this.content.length;
  }
}
