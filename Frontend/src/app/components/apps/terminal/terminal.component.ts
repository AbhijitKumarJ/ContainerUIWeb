import { Component, ElementRef, ViewChild, AfterViewChecked, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TerminalService } from '../../../services/terminal.service';

interface TerminalCommand {
  command_name: string;
  is_non_interactive: boolean; // If true, command runs entirely in browser or one-off backend hit
  requires_ui_changes: boolean; // If true, affects UI outside of just printing text (e.g. prompt change)
  requires_alternate_implementation: boolean; // If true, handled by specific frontend method instead of generic backend pipe
  description: string;
}

const COMMAND_REGISTRY: TerminalCommand[] = [
  {
    command_name: 'cd',
    is_non_interactive: true, // Client-side path tracking mostly, interacts with "virtual" or "remote" state 
    requires_ui_changes: true,
    requires_alternate_implementation: true, // Handled partly in frontend, but calls backend to validate/resolve
    description: 'Change the shell working directory.'
  },
  {
    command_name: 'clear',
    is_non_interactive: true,
    requires_ui_changes: true,
    requires_alternate_implementation: true,
    description: 'Clear the terminal screen.'
  },
  {
    command_name: 'ls',
    is_non_interactive: false,
    requires_ui_changes: false,
    requires_alternate_implementation: false,
    description: 'List directory contents.'
  },
  {
    command_name: 'pwd',
    is_non_interactive: true, // We can show cached frontend state first for speed
    requires_ui_changes: false,
    requires_alternate_implementation: false, // Let backend handle pwd to be safe
    description: 'Print working directory.'
  },
  {
    command_name: 'help',
    is_non_interactive: true,
    requires_ui_changes: false,
    requires_alternate_implementation: true,
    description: 'Display information about builtin commands.'
  },
  {
    command_name: 'cat',
    is_non_interactive: false,
    requires_ui_changes: false,
    requires_alternate_implementation: false,
    description: 'Concatenate and print files.'
  },
  {
    command_name: 'date',
    is_non_interactive: true,
    requires_ui_changes: false,
    requires_alternate_implementation: false, // Let backend handle date
    description: 'Print the system date and time.'
  }
];

const CMD_TRANSLATION_WINDOWS: { [key: string]: string } = {
  'ls': 'dir',
  'pwd': 'cd', // 'cd' with no args in cmd prints path
  'cat': 'type',
  'touch': 'type nul >',
  'rm': 'del',
  'cp': 'copy',
  'mv': 'move',
  // 'clear' is handled locally
};

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="terminal-container" #terminalContainer (click)="focusInput()">
      <div class="output">
        @for (line of history(); track $index) {
          <div class="line">{{ line }}</div>
        }
      </div>
      <div class="input-line">
        <span class="prompt">[user&#64;container {{ currentDirectory() }}]$</span>
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
export class TerminalComponent implements AfterViewChecked, OnInit {
  @ViewChild('cmdInput') cmdInput!: ElementRef<HTMLInputElement>;
  @ViewChild('terminalContainer') private terminalContainer!: ElementRef;

  history = signal<string[]>(['Welcome to Container Web Terminal v1.0', 'Type "help" for commands.']);
  currentCmd = '';
  currentDirectory = signal<string>('~');
  osType = '';

  constructor(private terminalService: TerminalService) { }

  ngOnInit() {
    this.terminalService.init().subscribe({
      next: (res) => {
        if (res.cwd) {
          this.currentDirectory.set(res.cwd);
        }
        if (res.os_type) {
          this.osType = res.os_type;
        }
      },
      error: (err) => {
        this.history.update(h => [...h, `Error initializing terminal: ${err.message}`]);
      }
    });
  }

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
    const rawCmd = this.currentCmd.trim();
    if (!rawCmd) return;

    // Echo command
    this.history.update(h => [...h, `[user@container ${this.currentDirectory()}]$ ${rawCmd}`]);
    this.currentCmd = '';

    const args = rawCmd.split(' ');
    const cmdName = args[0];
    const cmdConfig = COMMAND_REGISTRY.find(c => c.command_name === cmdName);

    // If specific implementation required (mostly UI only like clear, or help)
    if (cmdConfig?.requires_alternate_implementation) {
      this.runAlternateImplementation(cmdName, args);
    } else {
      // Everything else goes to backend (including ls, pwd, cat, date, unknown commands)
      this.runBackendCommand(rawCmd, cmdName, args);
    }
  }

  private runAlternateImplementation(cmdName: string, args: string[]) {
    switch (cmdName) {
      case 'help':
        const helpText = 'Available commands:\n' + COMMAND_REGISTRY.map(c =>
          `  ${c.command_name.padEnd(10)} - ${c.description}`
        ).join('\n');
        this.history.update(h => [...h, helpText]);
        break;

      case 'clear':
        this.history.set([]);
        break;

      case 'cd':
        const targetPath = args.length > 1 ? args[1] : '~';
        // If target is '~', we might want to re-fetch default dir, but for now treating as explicit path if backend supports it
        // actually backend 'init' returns the default dir. 
        // For 'cd', we send to backend to resolve.

        // Special case: if target is '~', we can ask backend to reset to init dir? 
        // Or just send '~' and let backend handle expansion if implemented?
        // Our backend logic currently expects proper paths or relative paths.
        // Let's rely on backend relative path logic. 
        // Note: Backend python `os.path.join` won't handle `~` expansion automatically unless we use `expanduser`.

        this.terminalService.changeDirectory(targetPath, this.currentDirectory()).subscribe({
          next: (res) => {
            if (res.success && res.cwd) {
              this.currentDirectory.set(res.cwd);
            } else {
              this.history.update(h => [...h, `bash: cd: ${res.error || 'No such directory'}`]);
            }
          },
          error: (err) => {
            this.history.update(h => [...h, `bash: cd: Error communicating with server`]);
          }
        });
        break;
    }
  }

  private runBackendCommand(fullCmd: string, cmdName: string, args: string[]) {
    let finalCmd = fullCmd;

    // Translation logic for Windows
    if (this.osType === 'windows' && CMD_TRANSLATION_WINDOWS[cmdName]) {
      const translatedCmd = CMD_TRANSLATION_WINDOWS[cmdName];
      // Reconstruct command line. 
      // If args exist, perform substitution.
      // Simple case: substitute first word. for "cat file.txt" -> "type file.txt"
      // Regex replace first word
      finalCmd = fullCmd.replace(new RegExp(`^${cmdName}`), translatedCmd);
    }

    this.terminalService.executeCommand(finalCmd, this.currentDirectory()).subscribe({
      next: (res) => {
        if (res.output) this.history.update(h => [...h, res.output || '']);
        if (res.error) this.history.update(h => [...h, res.error || '']);
      },
      error: (err) => {
        this.history.update(h => [...h, `Error executing command: ${err.message}`]);
      }
    });
  }
}
