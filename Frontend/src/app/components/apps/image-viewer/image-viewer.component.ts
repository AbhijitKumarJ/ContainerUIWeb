import { Component, Input, signal, inject, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSystemService } from '../../../services/file-system.service';
import { WindowManagerService } from '../../../services/window-manager.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="viewer-container">
      <div class="toolbar">
        <div class="file-ops">
            <button class="tool-btn" (click)="openFile()" title="Open"><i class="fa-solid fa-folder-open"></i></button>
            <button class="tool-btn" (click)="saveFile()" title="Save"><i class="fa-solid fa-floppy-disk"></i></button>
            <button class="tool-btn" (click)="saveAs()" title="Save As"><i class="fa-solid fa-file-export"></i></button>
        </div>
        <span class="divider">|</span>
        <div class="view-ops">
           <button class="tool-btn" (click)="zoomIn()" title="Zoom In"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
           <button class="tool-btn" (click)="zoomOut()" title="Zoom Out"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
           <button class="tool-btn" (click)="resetZoom()" title="Reset Zoom"><i class="fa-solid fa-compress"></i></button>
        </div>
        <span class="divider">|</span>
        <div class="edit-ops">
            <button class="tool-btn" (click)="toggleResize()" [class.active]="showResizePanel()" title="Resize"><i class="fa-solid fa-expand"></i></button>
            <button class="tool-btn" (click)="toggleCrop()" [class.active]="isCropping()" title="Crop"><i class="fa-solid fa-crop"></i></button>
        </div>
        <span class="filename">{{ fileName() }}</span>
      </div>

      <!-- Resize Panel -->
      @if (showResizePanel()) {
        <div class="resize-panel">
            <div class="input-group">
                <label>Width:</label>
                <input type="number" [(ngModel)]="resizeWidth">
            </div>
            <div class="input-group">
                <label>Height:</label>
                <input type="number" [(ngModel)]="resizeHeight">
            </div>
            <button class="btn-apply" (click)="applyResize()">Apply</button>
        </div>
      }

      <!-- Crop Toolbar -->
      @if (isCropping()) {
        <div class="crop-toolbar">
            <span>Select area to crop</span>
            <button class="btn-apply" (click)="applyCrop()">Apply Crop</button>
            <button class="btn-cancel" (click)="cancelCrop()">Cancel</button>
        </div>
      }

      <div class="image-area" #scrollContainer>
        <div class="canvas-wrapper" [style.transform]="'scale(' + zoomLevel() + ')'" [style.transform-origin]="'top left'">
            <canvas #canvas 
                (mousedown)="onMouseDown($event)" 
                (mousemove)="onMouseMove($event)" 
                (mouseup)="onMouseUp($event)"
                (mouseleave)="onMouseUp($event)"></canvas>
            
            @if (isCropping() && selectionRect) {
                <div class="selection-rect"
                    [style.left.px]="selectionRect.x"
                    [style.top.px]="selectionRect.y"
                    [style.width.px]="selectionRect.w"
                    [style.height.px]="selectionRect.h">
                </div>
            }
        </div>
        
        @if (loading()) {
            <div class="loading">Loading image...</div>
        }
        @if (error()) {
            <div class="error-msg">Failed to load image</div>
        }
      </div>
      
      <div class="status-bar">
        {{ imageDimensions().width }} x {{ imageDimensions().height }} px | {{ zoomLevel() * 100 | number:'1.0-0' }}%
      </div>
    </div>
  `,
  styles: [`
    .viewer-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Segoe UI', sans-serif;
      overflow: hidden;
      position: relative;
    }

    .toolbar {
      background: #333333;
      padding: 5px 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #444;
      z-index: 10;
      flex-shrink: 0;
    }

    .file-ops, .view-ops, .edit-ops {
        display: flex;
        gap: 5px;
    }

    .divider { color: #555; }

    .tool-btn {
        background: transparent;
        border: none;
        color: #ccc;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        
        &:hover { background: #444; color: white; }
        &.active { background: #007fd4; color: white; }
    }

    .filename {
      margin-left: auto;
      font-size: 0.85rem;
      color: #aaa;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .image-area {
      flex: 1;
      overflow: auto;
      padding: 0;
      background: #252526;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      position: relative;
    }
    
    .canvas-wrapper {
        position: relative;
        margin: 20px; /* Some padding around canvas */
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMGg1djVIMHpNNSA1aDV2NUg1eiIgZmlsbD0iIzMzMyIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=');
    }

    canvas {
        display: block;
        backface-visibility: hidden;
    }

    .loading, .error-msg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #888;
    }
    .error-msg { color: #f48771; }

    .status-bar {
        background: #007acc;
        color: white;
        padding: 2px 10px;
        font-size: 0.75rem;
        display: flex;
        justify-content: flex-end;
    }

    .resize-panel {
        position: absolute;
        top: 40px;
        right: 10px;
        background: #252526;
        border: 1px solid #333;
        padding: 10px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);

        .input-group {
            display: flex;
            align-items: center;
            gap: 10px;
            label { width: 50px; font-size: 0.9rem; }
            input { width: 80px; padding: 4px; background: #3c3c3c; border: 1px solid #555; color: white; }
        }
    }

    .crop-toolbar {
        position: absolute;
        top: 45px;
        left: 50%;
        transform: translateX(-50%);
        background: #252526;
        padding: 8px 15px;
        border-radius: 20px;
        display: flex;
        gap: 10px;
        align-items: center;
        z-index: 20;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        font-size: 0.9rem;
    }

    .btn-apply, .btn-cancel {
        padding: 4px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
    }
    .btn-apply { background: #007fd4; color: white; &:hover { background: #0060a0; } }
    .btn-cancel { background: #3c3c3c; color: #ccc; &:hover { background: #4b4b4b; } }

    .selection-rect {
        position: absolute;
        border: 2px dashed #007fd4;
        background: rgba(0, 127, 212, 0.2);
        pointer-events: none;
    }
  `]
})
export class ImageViewerComponent {
  @Input() initialFileName = '';
  @Input() currentPath: string[] = [];

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  fs = inject(FileSystemService);
  wm = inject(WindowManagerService);

  fileName = signal('');
  activePath = signal<string[] | null>(null);

  loading = signal(false);
  error = signal(false);
  zoomLevel = signal(1);
  imageDimensions = signal({ width: 0, height: 0 });

  // Resize State
  showResizePanel = signal(false);
  resizeWidth = 0;
  resizeHeight = 0;

  // Crop State
  isCropping = signal(false);
  isSelecting = false;
  selectionRaw = { startX: 0, startY: 0, currX: 0, currY: 0 };

  get selectionRect() {
    if (!this.isSelecting && this.selectionRaw.currX === 0) return null;

    const x = Math.min(this.selectionRaw.startX, this.selectionRaw.currX);
    const y = Math.min(this.selectionRaw.startY, this.selectionRaw.currY);
    const w = Math.abs(this.selectionRaw.currX - this.selectionRaw.startX);
    const h = Math.abs(this.selectionRaw.currY - this.selectionRaw.startY);
    return { x, y, w, h };
  }

  private originalImage: HTMLImageElement | null = null;
  private ctx!: CanvasRenderingContext2D;

  ngOnInit() {
    this.fileName.set(this.initialFileName);
    this.activePath.set(this.currentPath);
    this.loadImage();
  }

  ngAfterViewInit() {
    // Don't need to do anything immediately, wait for load
  }

  loadImage() {
    if (!this.fileName()) return;
    this.loading.set(true);
    this.error.set(false);

    this.fs.getFileProperties(this.activePath() || [], this.fileName(), 'file').subscribe({
      next: (props) => {
        if (props && props.path) {
          const img = new Image();
          img.crossOrigin = "Anonymous"; // Handle potential CORS if serving from different port
          img.onload = () => {
            this.originalImage = img;
            this.imageDimensions.set({ width: img.width, height: img.height });
            this.resizeWidth = img.width;
            this.resizeHeight = img.height;
            this.renderImage();
            this.loading.set(false);
          };
          img.onerror = () => {
            this.error.set(true);
            this.loading.set(false);
          };

          const apiUrl = 'http://localhost:8000';
          const encodedPath = encodeURIComponent(props.path);
          img.src = `${apiUrl}/api/filesystem/serve?path=${encodedPath}`;
        } else {
          this.error.set(true);
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  renderImage(imgSource: HTMLImageElement | HTMLCanvasElement = this.originalImage!) {
    if (!imgSource || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    canvas.width = imgSource.width;
    canvas.height = imgSource.height;
    this.ctx.drawImage(imgSource, 0, 0);

    this.imageDimensions.set({ width: canvas.width, height: canvas.height });
  }

  // File Operations
  async openFile() {
    const result = await this.wm.openFileDialog({
      mode: 'open',
      filters: ['png', 'jpg', 'jpeg', 'webp'],
      initialPath: this.activePath() || []
    });

    if (result) {
      this.activePath.set(result.path);
      this.fileName.set(result.fileName);
      this.loadImage();
    }
  }

  saveFile() {
    if (this.activePath() && this.fileName()) {
      this.saveToPath(this.activePath()!, this.fileName());
    } else {
      this.saveAs();
    }
  }

  async saveAs() {
    const result = await this.wm.openFileDialog({
      mode: 'save',
      defaultFileName: this.fileName() || 'image.png',
      initialPath: this.activePath() || []
    });

    if (result) {
      this.saveToPath(result.path, result.fileName);
    }
  }

  private saveToPath(path: string[], fileName: string) {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL('image/png'); // Default to PNG

    // Need to construct full path or path array?
    // getFileProperties in FS uses ensureRoot + path array + name.
    // saveImage expects full absolute path.
    // We can iterate: FS should expose helper to build absolute path OR we assume path passed from Open/Save dialog is valid for our manual construction if needed, OR relies on service.

    // Issue: 'path' from openFileDialog is directory path array. 'fileName' is string.
    // FileSystemService.saveImage expects a string path (absolute) or we can overload it to take array?
    // The current implementation I added takes 'path: string'.

    // Let's resolve the path first.
    this.fs.getFileProperties(path, fileName, 'file').subscribe({
      next: (props) => {
        // Props.path should be full path. Even if file doesn't exist? getFileProperties usually checks.
        // If creating new file, getFileProperties might fail.
        // We should probably use `createItem` logic or `getFileProperties` on the parent folder to get the parent path, then append filename.

        // Let's get parent directory props
        this.fs.getFileProperties(path, '', 'folder').subscribe(parentProps => {
          if (parentProps && parentProps.path) {
            const separator = parentProps.path.includes('/') ? '/' : '\\';
            const fullPath = parentProps.path + separator + fileName;

            this.fs.saveImage(fullPath, dataUrl).subscribe({
              next: () => {
                this.fileName.set(fileName);
                this.activePath.set(path);
                alert('Image Saved!');
              },
              error: (err) => console.error(err)
            });
          }
        });
      },
      error: () => {
        // Usually checking parent folder is safer
        this.fs.getFileProperties(path, '', 'folder').subscribe(parentProps => {
          if (parentProps && parentProps.path) {
            const separator = parentProps.path.includes('/') ? '/' : '\\';
            const fullPath = parentProps.path + separator + fileName;

            this.fs.saveImage(fullPath, dataUrl).subscribe({
              next: () => {
                this.fileName.set(fileName);
                this.activePath.set(path);
                alert('Image Saved!');
              },
              error: (err) => console.error(err)
            });
          }
        });
      }
    })
  }

  // Zoom
  zoomIn() { this.zoomLevel.update(v => Math.min(v + 0.5, 5)); }
  zoomOut() { this.zoomLevel.update(v => Math.max(v - 0.5, 0.5)); }
  resetZoom() { this.zoomLevel.set(1); }

  // Resize
  toggleResize() {
    this.cancelCrop();
    this.showResizePanel.update(v => !v);
  }

  applyResize() {
    if (!this.canvasRef || !this.resizeWidth || !this.resizeHeight) return;
    const canvas = this.canvasRef.nativeElement;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.resizeWidth;
    tempCanvas.height = this.resizeHeight;
    const tCtx = tempCanvas.getContext('2d')!;

    tCtx.drawImage(canvas, 0, 0, this.resizeWidth, this.resizeHeight);

    // Update main canvas
    this.renderImage(tempCanvas);
    this.showResizePanel.set(false);
  }

  // Crop
  toggleCrop() {
    this.showResizePanel.set(false);
    this.isCropping.update(v => !v);
    this.selectionRaw = { startX: 0, startY: 0, currX: 0, currY: 0 };
  }

  cancelCrop() {
    this.isCropping.set(false);
    this.selectionRaw = { startX: 0, startY: 0, currX: 0, currY: 0 };
  }

  applyCrop() {
    const rect = this.selectionRect;
    if (!rect || rect.w < 1 || rect.h < 1 || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rect.w;
    tempCanvas.height = rect.h;
    const tCtx = tempCanvas.getContext('2d')!;

    tCtx.drawImage(canvas, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

    this.renderImage(tempCanvas);
    this.cancelCrop();
  }

  // Mouse Events for Cropping
  onMouseDown(e: MouseEvent) {
    if (!this.isCropping()) return;
    e.preventDefault();
    this.isSelecting = true;
    const { x, y } = this.getMousePos(e);
    this.selectionRaw = { startX: x, startY: y, currX: x, currY: y };
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isCropping() || !this.isSelecting) return;
    const { x, y } = this.getMousePos(e);
    this.selectionRaw.currX = x;
    this.selectionRaw.currY = y;
  }

  onMouseUp(e: MouseEvent) {
    if (!this.isCropping()) return;
    this.isSelecting = false;
  }

  private getMousePos(e: MouseEvent) {
    if (!this.canvasRef) return { x: 0, y: 0 };
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    // Need to account for zoom if wrapped? 
    // The canvas itself is NOT transformed, the wrapper is.
    // So client coordinates relate to the scaled element. 
    // We need to divide by zoom level.

    const scale = this.zoomLevel();
    const x = (e.clientX - rect.left) / scale; // Simplification. 
    // Actually if wrapper is scaled, getBoundingClientRect of canvas reflects that.
    // So (e.clientX - rect.left) gives coordinate relative to visual top-left.
    // To get internal canvas coordinate, we multiply by (canvas.width / rect.width).

    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }
}
