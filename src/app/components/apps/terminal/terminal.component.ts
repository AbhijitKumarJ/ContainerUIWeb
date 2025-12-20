import { Component, ElementRef, ViewChild, AfterViewChecked, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-container" #terminalContainer (click)="focusInput()">
      <div class="output">
        @for (line of history(); track $index) {
          <div class="line">{{ line }}</div>
        }
      </div>
      <div class="input-line">
        <span class="prompt">[user&#64;container ~]$</span>
        <input #cmdInput 
               [(ngModel)]="currentCmd" 
               (keydown.enter)="execute()"
               type="text" 
               autocomplete="off" 
               spellcheck="false">
      </div>
    </div>
  `,
  styles: [`
    .terminal-container {
      background-color: #0c0c0c;
      color: #cccccc;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 14px;
      height: 100%;
      padding: 5px;
      overflow-y: auto;
      cursor: text;
    }

    .line {
      white-space: pre-wrap;
      line-height: 1.2;
    }

    .input-line {
      display: flex;
      margin-top: 2px;
    }

    .prompt {
      color: #87d700; /* Green prompt */
      margin-right: 8px;
    }

    input {
      background: transparent;
      border: none;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      flex: 1;
      outline: none;
      caret-color: #cccccc;
    }
  `]
})
export class TerminalComponent implements AfterViewChecked {
  @ViewChild('cmdInput') cmdInput!: ElementRef<HTMLInputElement>;
  @ViewChild('terminalContainer') private terminalContainer!: ElementRef;

  history = signal<string[]>(['Welcome to Container Web Terminal v1.0', 'Type "help" for commands.']);
  currentCmd = '';

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  focusInput() {
    this.cmdInput.nativeElement.focus();
  }

  scrollToBottom() {
    try {
      this.terminalContainer.nativeElement.scrollTop = this.terminalContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  execute() {
    const cmd = this.currentCmd.trim();
    if (!cmd) return;

    this.history.update(h => [...h, `[user@container ~]$ ${cmd}`]);

    // Mock Execution
    let response = '';
    switch (cmd) {
      case 'help':
        response = 'Available commands: help, clear, ls, pwd, cat <file>, date';
        break;
      case 'clear':
        this.history.set([]);
        this.currentCmd = '';
        return;
      case 'ls':
        response = 'bin  etc  home  usr  var';
        break;
      case 'pwd':
        response = '/home/user';
        break;
      case 'date':
        response = new Date().toString();
        break;
      default:
        response = `bash: ${cmd}: command not found`;
    }

    if (response) {
      this.history.update(h => [...h, response]);
    }

    this.currentCmd = '';
  }
}
