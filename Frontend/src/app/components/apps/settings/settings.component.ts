import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, BackgroundType } from '../../../services/settings.service';
import { DefaultProgramSettingsComponent } from './default-program-settings/default-program-settings.component';
import { WindowManagerService } from '../../../services/window-manager.service';
import { FileSystemService } from '../../../services/file-system.service';
import { BackupService } from '../../../services/backup.service';
import { AppRegistryService } from '../../../services/app-registry.service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DefaultProgramSettingsComponent],
  template: `
    <div class="settings-layout">
        <div class="sidebar">
            <div class="nav-item" [class.active]="activeTab() === 'personalization'" (click)="activeTab.set('personalization')">
                <i class="fa-solid fa-paintbrush"></i> Personalization
            </div>
            <div class="nav-item" [class.active]="activeTab() === 'apps'" (click)="activeTab.set('apps')">
                <i class="fa-solid fa-rocket"></i> Default Apps
            </div>
            <div class="nav-item" [class.active]="activeTab() === 'backup'" (click)="activeTab.set('backup')">
                <i class="fa-solid fa-floppy-disk"></i> Backup & Restore
            </div>
        </div>
        
        <div class="content">
            @if (activeTab() === 'personalization') {
                <div class="settings-container">
                    <h2>Personalization</h2>
                    
                    <div class="setting-group">
                        <h3>Background</h3>
                        
                        <div class="radio-group">
                        <label>
                            <input type="radio" name="bgType" value="color" 
                                [checked]="settings.backgroundType() === 'color'" 
                                (change)="setType('color')">
                            Solid Color
                        </label>
                        <label>
                            <input type="radio" name="bgType" value="image" 
                                [checked]="settings.backgroundType() === 'image'" 
                                (change)="setType('image')">
                            Image
                        </label>
                        </div>

                        <div class="control-area">
                        @if (settings.backgroundType() === 'color') {
                            <div class="color-picker">
                            <label for="bgColor">Pick a color:</label>
                            <input type="color" id="bgColor" 
                                    [value]="settings.backgroundColor()" 
                                    (input)="onColorChange($event)">
                            </div>
                        } @else {
                            <div class="image-uploader">
                                <div class="action-buttons">
                                    <label for="bgImage" class="upload-btn">
                                        <i class="fa-solid fa-upload"></i> Upload from Client
                                    </label>
                                    <input type="file" id="bgImage" accept="image/*" (change)="onFileSelected($event)" hidden>

                                    <button class="upload-btn system-btn" (click)="openSystemFilePicker()">
                                        <i class="fa-solid fa-hard-drive"></i> Select from System
                                    </button>
                                </div>
                            
                                @if (wallpapers().length > 0) {
                                    <div class="wallpaper-grid">
                                        @for (wp of wallpapers(); track wp) {
                                            <div class="wallpaper-item" (click)="onWallpaperSelect(wp)">
                                                <img [src]="wp" [class.selected]="settings.backgroundImage() === wp">
                                            </div>
                                        }
                                    </div>
                                }

                                @if (settings.backgroundImage()) {
                                    <div class="preview">
                                    <p>Current Selection:</p>
                                    <img [src]="settings.backgroundImage()" alt="Background Preview">
                                    </div>
                                }
                            </div>
                        }
                        </div>
                    </div>
                </div>
            } @else if (activeTab() === 'apps') {
                <app-default-program-settings></app-default-program-settings>
            } @else if (activeTab() === 'backup') {
                <div class="settings-container">
                    <h2>Backup & Restore</h2>
                    <p class="desc">Export your settings, wallpapers, extensions, and bookmarks to the host machine, or import them back.</p>

                    <div class="setting-group">
                        <h3>Export Data</h3>
                        <p>Create a backup of your current configuration.</p>
                        <button class="action-btn" (click)="exportData()" [disabled]="loading()">
                            @if(loading()){ <i class="fa-solid fa-spinner fa-spin"></i> } @else { <i class="fa-solid fa-download"></i> } Export & Download
                        </button>
                    </div>

                    <div class="setting-group" style="margin-top: 20px;">
                        <h3>Import Data</h3>
                         <div class="warning-box">
                            <strong><i class="fa-solid fa-triangle-exclamation"></i> Warning</strong>
                            <p>Importing data will OVERWRITE your current settings, wallpapers, extensions, and bookmarks. This action cannot be undone.</p>
                        </div>
                        <p>Restore configuration from a previously exported backup.</p>
                        
                        <div class="import-area">
                            <input type="file" #fileInput (change)="importData($event)" accept=".zip" hidden>
                            <button class="action-btn" (click)="fileInput.click()" [disabled]="loading()">
                                @if(loading()){ <i class="fa-solid fa-spinner fa-spin"></i> } @else { <i class="fa-solid fa-upload"></i> } Select Backup File
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    </div>
  `,
  styles: [`
    .settings-layout {
        display: flex;
        height: 100%;
        color: #e0e0e0;
        font-family: 'Segoe UI', sans-serif;
    }
    
    .sidebar {
        width: 200px;
        background: #252526;
        border-right: 1px solid #333;
        padding-top: 10px;
    }
    
    .nav-item {
        padding: 10px 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #aaa;
        
        &:hover { background: #2a2d2e; color: #e0e0e0; }
        &.active { background: #37373d; color: white; border-left: 3px solid #007fd4; }
    }
    
    .content {
        flex: 1;
        overflow-y: auto;
        background: #1e1e1e;
    }

    .settings-container {
      padding: 20px;
    }

    h2 {
      margin-top: 0;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 20px;
      font-weight: normal;
    }

    .setting-group {
      background: #252526;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #333;
    }

    h3 {
      margin-top: 0;
      font-size: 1.1em;
      margin-bottom: 15px;
    }

    .radio-group {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }

    .radio-group label {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .control-area {
      min-height: 100px;
    }

    .color-picker {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .action-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: #007fd4;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .upload-btn:hover {
      background-color: #0060a0;
    }
    
    .system-btn {
        background-color: #3a3d41;
    }
    .system-btn:hover {
        background-color: #505357;
    }

    .wallpaper-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .wallpaper-item {
        aspect-ratio: 16/9;
        cursor: pointer;
        border: 2px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        
        &:hover { border-color: #555; }
        
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            
            &.selected {
                border: 2px solid #007fd4;
            }
        }
    }

    .preview {
      margin-top: 15px;
      border-top: 1px solid #333;
      padding-top: 10px;
    }

    .preview img {
      max-width: 300px;
      max-height: 200px;
      border-radius: 4px;
      border: 1px solid #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .desc { color: #888; font-size: 0.9rem; margin-bottom: 20px; }
    
    .action-btn {
        background-color: #007fd4;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        transition: background 0.2s;
        
        &:hover { background-color: #0060a0; }
        &:disabled { background-color: #555; cursor: not-allowed; }
    }
    
    .warning-box {
        background: #3e3000;
        border: 1px solid #7a6a00;
        color: #ffda70;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
        
        strong { display: block; margin-bottom: 5px; color: #ffeb3b; }
        p { margin: 0; font-size: 0.9rem; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings = inject(SettingsService);
  wm = inject(WindowManagerService);
  fs = inject(FileSystemService);
  backupService = inject(BackupService);
  registry = inject(AppRegistryService);

  activeTab = signal<'personalization' | 'apps' | 'backup'>('personalization');
  loading = signal(false);

  wallpapers = signal<string[]>([]);

  ngOnInit() {
    this.loadWallpapers();
  }

  loadWallpapers() {
    this.settings.getWallpapers().subscribe(res => {
      this.wallpapers.set(res.wallpapers);
    });
  }

  setType(type: BackgroundType) {
    this.settings.setBackgroundType(type);
  }

  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.settings.setBackgroundColor(input.value);
  }

  onWallpaperSelect(url: string) {
    this.settings.setBackgroundImage(url);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.settings.uploadWallpaper(file).subscribe(res => {
        this.loadWallpapers();
        this.settings.setBackgroundImage(res.url);
      });
    }
  }

  openSystemFilePicker() {
    this.wm.openFileDialog({
      mode: 'open',
      filters: ['.png', '.jpg', '.jpeg', '.webp']
    }).then(res => {
      if (res) {
        const fullPath = this.fs.getFullPath([...res.path, res.fileName]);

        this.settings.addWallpaperFromPath(fullPath).subscribe(result => {
          if (result.success) {
            this.loadWallpapers();
            this.settings.setBackgroundImage(result.url);
          }
        });
      }
    });
  }

  exportData() {
    this.loading.set(true);
    // Gather frontend data
    const userData = {
      backgroundImage: localStorage.getItem('backgroundImage'),
      backgroundColor: localStorage.getItem('backgroundColor'),
      backgroundType: localStorage.getItem('backgroundType'),
      fileAssociations_v2: localStorage.getItem('fileAssociations_v2'),
      browserBookmarks: localStorage.getItem('browserBookmarks')
    };

    this.backupService.exportData(userData).subscribe({
      next: (res) => {
        // Trigger download
        const downloadUrl = `http://localhost:8000/api/file-transfer/download/${res.filename}`;
        window.open(downloadUrl, '_blank');
        this.loading.set(false);
        alert('Export successful! Download starting...');
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        alert('Export failed. Check console for details.');
      }
    });
  }

  importData(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      if (!confirm('Are you sure you want to import this backup? Current data will be overwritten.')) {
        input.value = '';
        return;
      }

      this.loading.set(true);
      const file = input.files[0];

      this.backupService.importData(file).subscribe({
        next: (res) => {
          const data = res.user_data;
          // Restore frontend data
          if (data.backgroundImage) localStorage.setItem('backgroundImage', data.backgroundImage);
          if (data.backgroundColor) localStorage.setItem('backgroundColor', data.backgroundColor);
          if (data.backgroundType) localStorage.setItem('backgroundType', data.backgroundType);
          if (data.fileAssociations_v2) localStorage.setItem('fileAssociations_v2', JSON.stringify(data.fileAssociations_v2)); // Note: backend dumps as object, so we might receive it as object.
          // Wait, export sends `localStorage.getItem` which is string.
          // But backend `json.dump` might keep it as string if I didn't parse it.
          // I sent `{ key: value }` where value is the string from localStorage.
          // So `res.user_data.fileAssociations_v2` should be the JSON string.
          // Actually JSON.dump will treat it as a string.

          // Let's verify:
          // export: `fileAssociations_v2: localStorage.getItem(...)` -> this is a string "{\"ext\":...}"
          // backend json.dump -> "fileAssociations_v2": "{\"ext\":...}"
          // import response: `user_data` object
          // `data.fileAssociations_v2` is the string.

          // Wait, if I want to update services, I should probably reload the page or force update.
          // Reloading is safest to ensure all services re-read localStorage.

          if (data.fileAssociations_v2) localStorage.setItem('fileAssociations_v2', data.fileAssociations_v2);
          if (data.browserBookmarks) localStorage.setItem('browserBookmarks', data.browserBookmarks);

          this.loading.set(false);
          alert('Import successful! The application will now reload to apply changes.');
          window.location.reload();
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
          alert('Import failed. ' + (err.error?.detail || err.message));
        }
      });
    }
  }
}
