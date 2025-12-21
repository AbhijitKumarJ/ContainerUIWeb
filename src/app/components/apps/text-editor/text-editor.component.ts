import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSystemService } from '../../../services/file-system.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <div class="toolbar">
        <button class="tool-btn" (click)="save()"><i class="fa-solid fa-floppy-disk"></i> Save</button>
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
  @Input() currentPath: string[] = [];

  private fs = inject(FileSystemService);

  content = '';
  fileName = signal('Untitled.txt');

  ngOnInit() {
    this.fileName.set(this.initialFileName);

    // If content is provided explicitly, use it.
    if (this.initialContent) {
      this.content = this.initialContent;
    }
    // Otherwise, if we have a path/filename context, try to read from FS
    else if (this.currentPath && this.initialFileName && this.initialFileName !== 'Untitled.txt') {
      this.loadFile();
    }
  }

  loadFile() {
    this.fs.readFile(this.currentPath, this.initialFileName).subscribe({
      next: (res: { content: string }) => {
        this.content = res.content;
      },
      error: (err: any) => {
        console.error('Failed to load file:', err);
        this.content = 'Error loading file content.';
      }
    });
  }

  save() {
    if (this.currentPath && this.fileName() !== 'Untitled.txt') {
      this.fs.writeFile(this.currentPath, this.fileName(), this.content).subscribe({
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
      console.log('Saving new file not implemented yet (needs Save As dialog)', this.fileName());
      // For now just alert mock
      alert(`File "${this.fileName()}" saved (simulation)!`);
    }
  }

  getLines() {
    return this.content.split('\n').length;
  }

  getChars() {
    return this.content.length;
  }
}
