import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowManagerService } from '../../../services/window-manager.service';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="taskbar-container">
      <button class="start-btn" title="Show Applications" (click)="wm.toggleStartMenu()">
        <i class="fa-solid fa-layer-group"></i>
      </button>

      <div class="running-apps">
        @for (window of wm.windows(); track window.id) {
          <div class="app-tab" 
               [class.active]="window.isActive"
               (click)="activateWindow(window.id)">
            <i [class]="window.icon"></i> {{ window.title }}
          </div>
        }
      </div>

      <div class="system-tray">
        <span class="clock">{{ currentTime | date:'shortTime' }}</span>
      </div>
    </div>
  `,
  styles: [`
    .taskbar-container {
      height: var(--taskbar-height, 48px);
      background: rgba(30, 30, 30, 0.85);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      padding: 0 10px;
      color: white;
      z-index: 10000;
      user-select: none;
    }

    .start-btn {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      padding: 5px 15px;
      cursor: pointer;
      transition: transform 0.1s;
      
      &:hover {
        transform: scale(1.1);
        color: var(--accent-color);
      }
    }

    .running-apps {
      flex: 1;
      display: flex;
      gap: 5px;
      margin-left: 10px;
    }

    .app-tab {
      background: rgba(255, 255, 255, 0.05);
      padding: 5px 15px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      font-size: 0.9rem;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        background: rgba(255, 255, 255, 0.15);
        border-bottom-color: var(--accent-color, #0d6efd);
      }
    }

    .system-tray {
      margin-left: auto;
      font-size: 0.85rem;
      padding: 0 10px;
    }
  `]
})
export class TaskbarComponent {
  wm = inject(WindowManagerService);
  currentTime = new Date();

  constructor() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000); // Update every minute
  }

  activateWindow(id: string) {
    const win = this.wm.windows().find(w => w.id === id);
    if (win?.isMinimized || !win?.isActive) {
      this.wm.restoreWindow(id);
    } else {
      this.wm.minimizeWindow(id);
    }
  }
}
