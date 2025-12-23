import { Component, Input, ViewChild, ViewContainerRef, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WindowConfig } from '../../../models/window-config.interface';
import { WindowManagerService } from '../../../services/window-manager.service';

@Component({
  selector: 'app-window-frame',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="window-frame"
         cdkDrag
         [cdkDragDisabled]="config.isMaximized"
         [cdkDragBoundary]="'.desktop-wallpaper'"
         [cdkDragFreeDragPosition]="config.position"
         (cdkDragEnded)="onDragEnd($event)"
         [style.z-index]="config.zIndex"
         [style.width.px]="config.isMaximized ? null : config.size.width"
         [style.height.px]="config.isMaximized ? null : config.size.height"
         [class.active]="config.isActive"
         [class.minimized]="config.isMinimized"
         [class.maximized]="config.isMaximized"
         (mousedown)="onFocus()">
      
      <!-- Title Bar -->
      <div class="title-bar" cdkDragHandle (dblclick)="toggleMaximize()">
        <div class="title-left">
          <i [class]="config.icon"></i>
          <span class="title-text">{{ config.title }}</span>
        </div>
        <div class="window-controls">
          <button class="control-btn minimize" (click)="minimize($event)">
            <i class="fa-solid fa-minus"></i>
          </button>
          <button class="control-btn maximize" (click)="toggleMaximize($event)">
            <i class="fa-regular" [ngClass]="config.isMaximized ? 'fa-window-restore' : 'fa-square'"></i>
          </button>
          <button class="control-btn close" (click)="close($event)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="window-content" [style.display]="config.isMinimized ? 'none' : 'block'">
        <ng-container *ngComponentOutlet="config.component; inputs: config.inputs"></ng-container>
      </div>

      <!-- Resize Handle -->
      @if (!config.isMaximized) {
        <div class="resize-handle" (mousedown)="startResize($event)"></div>
      }
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      overflow: visible;
    }

    .window-frame {
      position: absolute;
      background: var(--window-bg-color, #333);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 300px;
      min-height: 200px;
      width: 800px;
      height: 600px;
      max-height: calc(100vh - var(--taskbar-height) - 20px); /* Safety margin */
      transition: opacity 0.2s, transform 0.2s;

      &.active {
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
      }

      &.minimized {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.8) translateY(200px);
      }

      &.maximized {
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: calc(100vh - 48px) !important;
        max-height: none !important;
        transform: none !important;
        border-radius: 0;
      }
    }

    .title-bar {
      height: 32px;
      background: rgba(40, 40, 40, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      cursor: default;
      user-select: none;

      .title-left {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: #ccc;
        
        i { color: var(--accent-color, #0d6efd); }
      }
    }

    .window-controls {
      display: flex;
      gap: 5px;

      .control-btn {
        background: transparent;
        border: none;
        color: #aaa;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        transition: background 0.1s, color 0.1s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        &.close:hover {
          background: #d32f2f;
        }
      }
    }

    .window-content {
      flex: 1;
      overflow: auto;
      background: #1e1e1e;
      position: relative;
    }

    .resize-handle {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 15px;
      height: 15px;
      cursor: nwse-resize;
      background: transparent;
      z-index: 100;
      
      /* Optional visual indicator */
      &::after {
        content: '';
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 6px;
        height: 6px;
        border-right: 2px solid rgba(255, 255, 255, 0.4);
        border-bottom: 2px solid rgba(255, 255, 255, 0.4);
      }
    }
  `]
})
export class WindowFrameComponent {
  @Input({ required: true }) config!: WindowConfig;

  // Resize State
  private isResizing = false;
  private resizeStartSize = { width: 0, height: 0 };
  private resizeStartPos = { x: 0, y: 0 };

  constructor(private windowManager: WindowManagerService) { }

  onFocus() {
    this.windowManager.focusWindow(this.config.id);
  }

  minimize(event: Event) {
    event.stopPropagation();
    this.windowManager.minimizeWindow(this.config.id);
  }

  toggleMaximize(event?: Event) {
    if (event) event.stopPropagation();
    this.windowManager.toggleMaximize(this.config.id);
  }

  close(event: Event) {
    event.stopPropagation();
    this.windowManager.closeWindow(this.config.id);
  }

  onDragEnd(event: any) {
    // Current position after drag
    const element = event.source.getRootElement();
    const transform = element.style.transform;
    const regex = /translate3d\(([-0-9.]+)px,\s*([-0-9.]+)px,\s*([-0-9.]+)px\)/;
    const match = transform.match(regex);

    // We need to calculate absolute position from free drag
    // CDK Drag stores position in internal state, but visually applied via transform
    // Safer to get bounding rect relative to parent?
    // Actually cdkDragFreeDragPosition Input binds it. 
    // Wait, if we use cdkDragFreeDragPosition, we should update that value on drag end.

    const { x, y } = event.source.getFreeDragPosition();
    this.windowManager.updateWindowPosition(this.config.id, x, y);
  }

  // --- Resize Logic ---
  startResize(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeStartSize = { width: this.config.size.width, height: this.config.size.height };
    this.resizeStartPos = { x: event.clientX, y: event.clientY };

    // Add global listeners
    window.addEventListener('mousemove', this.onResize);
    window.addEventListener('mouseup', this.stopResize);
  }

  onResize = (event: MouseEvent) => {
    if (!this.isResizing) return;

    const dx = event.clientX - this.resizeStartPos.x;
    const dy = event.clientY - this.resizeStartPos.y;

    const newWidth = Math.max(300, this.resizeStartSize.width + dx);
    const newHeight = Math.max(200, this.resizeStartSize.height + dy);

    // Update style directly for performance? 
    // Or update signal via service (might be choppy if angular change detection logic runs every pixel)
    // Let's use service update for now for correct state. 
    // If slow, we handle locally via DOM ref then update on stop.
    // For now, simple service update.
    this.windowManager.updateWindowSize(this.config.id, newWidth, newHeight);
  }

  stopResize = () => {
    this.isResizing = false;
    window.removeEventListener('mousemove', this.onResize);
    window.removeEventListener('mouseup', this.stopResize);
  }
}
