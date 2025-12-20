import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowManagerService } from '../../../services/window-manager.service';
import { FileExplorerComponent } from '../../apps/file-explorer/file-explorer.component';
import { TerminalComponent } from '../../apps/terminal/terminal.component';
import { ProcessManagerComponent } from '../../apps/process-manager/process-manager.component';
import { TextEditorComponent } from '../../apps/text-editor/text-editor.component';
import { BrowserComponent } from '../../apps/browser/browser.component';
import { CalculatorComponent } from '../../apps/calculator/calculator.component';

@Component({
  selector: 'app-start-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="start-menu-overlay" (click)="close()">
      <div class="app-grid" (click)="$event.stopPropagation()">
        <div class="search-bar">
          <i class="fa-solid fa-search"></i>
          <input type="text" placeholder="Type to search..." autofocus>
        </div>
        
        <div class="apps-container">
           <div class="app-item" (click)="launch('file-explorer', feComp, 'File Explorer', 'fa-solid fa-folder-open')">
             <div class="icon-box"><i class="fa-solid fa-folder-open"></i></div>
             <span>Files</span>
           </div>
           
           <div class="app-item" (click)="launch('terminal', termComp, 'Terminal', 'fa-solid fa-terminal')">
             <div class="icon-box"><i class="fa-solid fa-terminal"></i></div>
             <span>Terminal</span>
           </div>

           <div class="app-item" (click)="launch('process-manager', pmComp, 'Task Manager', 'fa-solid fa-chart-line')">
             <div class="icon-box"><i class="fa-solid fa-chart-line"></i></div>
             <span>System Monitor</span>
           </div>

           <div class="app-item" (click)="launch('text-editor', txtComp, 'Text Editor', 'fa-solid fa-file-lines')">
             <div class="icon-box"><i class="fa-solid fa-file-lines"></i></div>
             <span>Text Editor</span>
           </div>

           <div class="app-item" (click)="launch('browser', brwComp, 'Browser', 'fa-brands fa-firefox-browser')">
             <div class="icon-box"><i class="fa-brands fa-firefox-browser"></i></div>
             <span>Browser</span>
           </div>
           
           <div class="app-item" (click)="launch('calculator', calcComp, 'Calculator', 'fa-solid fa-calculator')">
             <div class="icon-box"><i class="fa-solid fa-calculator"></i></div>
             <span>Calculator</span>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .start-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh; /* Full screen overlay like Ubuntu */
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s;
    }

    .app-grid {
      width: 80%;
      max-width: 900px;
      height: 70%;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: zoomIn 0.2s;
    }

    .search-bar {
      width: 50%;
      background: rgba(60, 60, 60, 0.9);
      border-radius: 25px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 40px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      i { color: #aaa; }
      
      input {
        background: transparent;
        border: none;
        color: white;
        flex: 1;
        outline: none;
        font-size: 1.1rem;
      }
    }

    .apps-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 30px;
      width: 100%;
      justify-items: center;
    }

    .app-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      color: white;
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.1);
        .icon-box { background: rgba(255, 255, 255, 0.1); }
      }

      .icon-box {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
      }
      
      span {
        font-size: 0.9rem;
      }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { transform: scale(0.9); } to { transform: scale(1); } }
  `]
})
export class StartMenuComponent {
  wm = inject(WindowManagerService);

  // App References
  feComp = FileExplorerComponent;
  termComp = TerminalComponent;
  pmComp = ProcessManagerComponent;
  txtComp = TextEditorComponent;
  brwComp = BrowserComponent;
  calcComp = CalculatorComponent;

  close() {
    this.wm.toggleStartMenu();
  }

  launch(id: string, comp: any, title: string, icon: string) {
    this.wm.openApp(id, comp, title, icon);
    this.close();
  }
}
