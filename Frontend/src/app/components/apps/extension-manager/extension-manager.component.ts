
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WindowManagerService } from '../../../services/window-manager.service';
import { ExtensionLoaderComponent } from '../../os/extension-loader/extension-loader.component';
import { ExtensionService } from '../../../services/extension.service';

interface Extension {
  id: string;
  name: string;
  version: string;
  icon?: string;
  url: string;
  defaultSize?: { width: number, height: number };
}

@Component({
  selector: 'app-extension-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="extension-manager">
      <div class="toolbar">
        <h3>Installed Extensions</h3>
        <input type="file" #fileInput (change)="uploadExtension($event)" accept=".zip" style="display: none">
        <button (click)="fileInput.click()">Install Extension (.zip)</button>
        <button (click)="loadExtensions()">Refresh</button>
      </div>

      <div class="extension-list">
        <div *ngFor="let ext of extensions" class="extension-item">
          <div class="icon">
            <i [class]="ext.icon || 'fa-solid fa-puzzle-piece'"></i>
          </div>
          <div class="details">
            <h4>{{ ext.name }}</h4>
            <p>v{{ ext.version }} - {{ ext.id }}</p>
          </div>
          <div class="actions">
            <button (click)="launch(ext)">Launch</button>
            <button class="remove-btn" (click)="removeExtension(ext.id)">Remove</button>
          </div>
        </div>
        
        <div *ngIf="extensions.length === 0" class="no-extensions">
             No extensions installed. Upload a .zip file to get started.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extension-manager { padding: 20px; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; }
    .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
    .toolbar h3 { margin: 0; flex-grow: 1; }
    
    .extension-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
    
    .extension-item { 
      display: flex; align-items: center; gap: 15px; padding: 10px; 
      background: #2b2b2b; border-radius: 8px;
      border: 1px solid #3e3e3e;
      color: #eee;
    }
    .icon { font-size: 24px; width: 40px; text-align: center; color: #eee; }
    .details { flex-grow: 1; }
    .details h4 { margin: 0 0 5px 0; color: #fff; }
    .details p { margin: 0; font-size: 12px; color: #aaa; }
    
    button { 
      padding: 8px 12px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; 
    }
    button:hover { background: #0056b3; }
    .remove-btn { background: #dc3545; margin-left: 5px; }
    .remove-btn:hover { background: #bd2130; }
  `]
})
export class ExtensionManagerComponent implements OnInit {
  extensions: Extension[] = [];
  http = inject(HttpClient);
  wm = inject(WindowManagerService);
  extService = inject(ExtensionService);
  apiUrl = 'http://localhost:8000/api/extensions';

  ngOnInit() {
    this.loadExtensions();
    // Also refresh registry to be sure
    this.extService.refresh();
  }

  loadExtensions() {
    this.http.get<Extension[]>(`${this.apiUrl}/list`).subscribe(data => {
      this.extensions = data;
    });
  }

  uploadExtension(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${this.apiUrl}/install`, formData).subscribe({
      next: (res) => {
        alert('Extension installed!');
        this.loadExtensions();
        this.extService.refresh();
      },
      error: (err) => {
        alert('Failed to install: ' + err.error?.detail || err.message);
      }
    });
  }

  launch(ext: Extension) {
    this.wm.openApp(
      ext.id,
      ExtensionLoaderComponent,
      ext.name,
      ext.icon || 'fa-solid fa-puzzle-piece',
      { url: ext.url, extId: ext.id },
      ext.defaultSize ? ext.defaultSize : { width: 800, height: 600 }
    );
  }

  removeExtension(id: string) {
    if (confirm('Are you sure you want to remove this extension?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadExtensions();
          this.extService.refresh();
        },
        error: (err) => {
          alert('Failed to remove extension: ' + (err.error?.detail || err.message));
        }
      });
    }
  }
}
