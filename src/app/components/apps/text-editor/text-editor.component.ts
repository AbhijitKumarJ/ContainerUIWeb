import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

    content = '';
    fileName = signal('Untitled.txt');

    ngOnInit() {
        this.content = this.initialContent;
        this.fileName.set(this.initialFileName);
    }

    save() {
        // Mock Save
        console.log('Saving file:', this.fileName(), this.content);
        alert(`File "${this.fileName()}" saved!`);
    }

    getLines() {
        return this.content.split('\n').length;
    }

    getChars() {
        return this.content.length;
    }
}
