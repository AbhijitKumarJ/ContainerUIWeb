import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskbarComponent } from '../taskbar/taskbar.component';
import { WindowFrameComponent } from '../window-manager/window-frame.component';
import { DesktopIconComponent } from './desktop-icon.component';
import { StartMenuComponent } from '../start-menu/start-menu.component';
import { WindowManagerService } from '../../../services/window-manager.service';
import { FileExplorerComponent } from '../../apps/file-explorer/file-explorer.component';
import { TerminalComponent } from '../../apps/terminal/terminal.component';
import { ProcessManagerComponent } from '../../apps/process-manager/process-manager.component';
import { TextEditorComponent } from '../../apps/text-editor/text-editor.component';
import { BrowserComponent } from '../../apps/browser/browser.component';
import { CalculatorComponent } from '../../apps/calculator/calculator.component';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [CommonModule, TaskbarComponent, WindowFrameComponent, DesktopIconComponent, StartMenuComponent],
  template: `
    <div class="desktop-wallpaper">
      <!-- Icons and Windows -->
      @for (window of wm.windows(); track window.id) {
        <app-window-frame [config]="window"></app-window-frame>
      }

      <div class="desktop-icons">
        <app-desktop-icon label="File Explorer" icon="fa-solid fa-folder-open" (dblclick)="openFileExplorer()"></app-desktop-icon>
        <app-desktop-icon label="Terminal" icon="fa-solid fa-terminal" (dblclick)="openTerminal()"></app-desktop-icon>
        <app-desktop-icon label="Task Manager" icon="fa-solid fa-chart-line" (dblclick)="openProcessManager()"></app-desktop-icon>
        <app-desktop-icon label="Text Editor" icon="fa-solid fa-file-lines" (dblclick)="openTextEditor()"></app-desktop-icon>
        <app-desktop-icon label="Browser" icon="fa-brands fa-firefox-browser" (dblclick)="openBrowser()"></app-desktop-icon>
        <app-desktop-icon label="Calculator" icon="fa-solid fa-calculator" (dblclick)="openCalculator()"></app-desktop-icon>
      </div>

      @if (wm.showStartMenu()) {
        <app-start-menu></app-start-menu>
      }
      
      <app-taskbar></app-taskbar>
    </div>
  `,
  styles: [`
    .desktop-wallpaper {
      width: 100vw;
      height: 100vh;
      /* Ubuntu-ish Mesh Gradient */
      background: radial-gradient(circle at 50% 0%, #5e2750 0%, #2c001e 60%, #2c001e 100%);
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end; /* Push taskbar to bottom */
    }

    .desktop-icons {
      position: absolute;
      top: 10px;
      left: 10px;
      bottom: var(--taskbar-height);
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 10px;
      max-height: 100%;
    }
  `]
})
export class DesktopComponent {
  wm = inject(WindowManagerService);

  openFileExplorer() {
    this.wm.openApp('file-explorer', FileExplorerComponent, 'File Explorer', 'fa-solid fa-folder-open');
  }

  openTerminal() {
    this.wm.openApp('terminal', TerminalComponent, 'Terminal', 'fa-solid fa-terminal');
  }

  openProcessManager() {
    this.wm.openApp('process-manager', ProcessManagerComponent, 'Task Manager', 'fa-solid fa-chart-line');
  }

  openTextEditor() {
    this.wm.openApp('text-editor', TextEditorComponent, 'Text Editor', 'fa-solid fa-file-lines');
  }

  openBrowser() {
    this.wm.openApp('browser', BrowserComponent, 'Browser', 'fa-brands fa-firefox-browser');
  }

  openCalculator() {
    this.wm.openApp('calculator', CalculatorComponent, 'Calculator', 'fa-solid fa-calculator');
  }
}
