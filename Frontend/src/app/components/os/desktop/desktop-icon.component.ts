import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-desktop-icon',
    standalone: true,
    imports: [CommonModule, DragDropModule],
    template: `
    <div class="desktop-icon" cdkDrag>
      <div class="icon-wrapper">
        <i [class]="icon"></i>
      </div>
      <div class="label">{{ label }}</div>
    </div>
  `,
    styles: [`
    .desktop-icon {
      width: 80px;
      height: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 4px;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
      margin: 10px;
      position: absolute; /* Allows manual positioning if needed, or grid layout context */
      
      /* Make it behave nicely in a grid or free flow */
      position: relative; 
      float: left;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .icon-wrapper {
        font-size: 2.5rem;
        margin-bottom: 5px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      }

      .label {
        font-size: 0.85rem;
        text-align: center;
        line-height: 1.1;
        word-break: break-word;
      }
    }
  `]
})
export class DesktopIconComponent {
    @Input({ required: true }) label!: string;
    @Input({ required: true }) icon!: string;
}
