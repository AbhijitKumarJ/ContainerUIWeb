import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppRegistryService, AppDefinition, AssociationConfig } from '../../../../services/app-registry.service';

@Component({
    selector: 'app-default-program-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="settings-container">
      <h3>Default Apps</h3>
      <p class="desc">Manage file associations and default programs.</p>

      <div class="top-bar">
          <input type="text" placeholder="Add extension (e.g. log)" #newExtInput (keyup.enter)="addExtension(newExtInput.value); newExtInput.value=''">
          <button (click)="addExtension(newExtInput.value); newExtInput.value=''">Add Ext</button>
      </div>
      
      <div class="extension-list">
        @for (ext of allExtensions(); track ext) {
            <div class="ext-block">
                <div class="ext-header">
                    <span class="ext-name">.{{ ext }}</span>
                    <button class="btn-remove-ext" (click)="removeExtension(ext)" title="Remove Extension">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                
                <div class="ext-body">
                    <div class="row">
                        <label>Default:</label>
                        <select [ngModel]="getDefaultAppId(ext)" (ngModelChange)="setDefaultApp(ext, $event)">
                            <option [ngValue]="null">Let System Decide</option>
                            @for (app of getAssociatedApps(ext); track app.id) {
                                <option [value]="app.id">{{ app.name }}</option>
                            }
                        </select>
                    </div>

                    <div class="row associated-list">
                        <label>Associated:</label>
                        <div class="tags">
                            @for (app of getAssociatedApps(ext); track app.id) {
                                <div class="tag">
                                    {{ app.name }}
                                    <i class="fa-solid fa-xmark" (click)="removeAssociation(ext, app.id)"></i>
                                </div>
                            }
                            @if (getAssociatedApps(ext).length === 0) {
                                <span class="no-apps">No apps associated.</span>
                            }
                        </div>
                    </div>

                    <div class="row add-app">
                        <select #addAppSelect>
                            <option value="" disabled selected>Add application...</option>
                            @for (app of getFileHandlers(); track app.id) {
                                <option [value]="app.id">{{ app.name }}</option>
                            }
                        </select>
                        <button (click)="addAssociation(ext, addAppSelect.value); addAppSelect.value=''">Add</button>
                    </div>
                </div>
            </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .settings-container {
      padding: 20px;
      color: #e0e0e0;
      font-family: 'Segoe UI', sans-serif;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    h3 { margin-top: 0; font-weight: normal; font-size: 1.5rem; margin-bottom: 5px; }
    .desc { color: #888; font-size: 0.9rem; margin-bottom: 20px; }
    
    .top-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        
        input {
            background: #3c3c3c;
            border: 1px solid #555;
            color: #e0e0e0;
            padding: 5px 10px;
            border-radius: 4px;
        }
        
        button {
            background: #3c3c3c;
            border: 1px solid #555;
            color: #e0e0e0;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            &:hover { background: #4b4b4b; }
        }
    }

    .extension-list {
        flex: 1;
        overflow-y: auto;
        border: 1px solid #333;
        border-radius: 4px;
        background: #252526;
        padding: 10px;
    }
    
    .ext-block {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 4px;
        margin-bottom: 15px;
        padding: 10px;
    }
    
    .ext-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
        margin-bottom: 10px;
        
        .ext-name {
            font-weight: bold;
            color: #519aba;
            font-size: 1.1rem;
        }
        
        .btn-remove-ext {
            background: transparent;
            border: none;
            color: #888;
            cursor: pointer;
            &:hover { color: #a42e2e; }
        }
    }
    
    .ext-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .row {
        display: flex;
        align-items: center;
        gap: 10px;
        
        label { width: 80px; color: #aaa; font-size: 0.9rem; }
    }
    
    select {
        background: #3c3c3c;
        border: 1px solid #555;
        color: #e0e0e0;
        padding: 4px 8px;
        border-radius: 4px;
        flex: 1;
        max-width: 300px;
    }
    
    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        flex: 1;
    }
    
    .tag {
        background: #37373d;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 6px;
        
        i { cursor: pointer; color: #888; &:hover { color: #ccc; } }
    }
    
    .no-apps { font-style: italic; color: #666; font-size: 0.9rem; }
    
    .add-app {
        button {
            padding: 4px 10px;
            background: #007fd4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            &:hover { background: #0060a0; }
        }
    }
  `]
})
export class DefaultProgramSettingsComponent {
    registry = inject(AppRegistryService);

    allExtensions = computed(() => this.registry.getConfiguredExtensions());

    // We can't easily compute file handlers reactively if not exposed as signal, 
    // but apps map is not signal. However, loading is mostly static.
    // Ideally registry should expose signals.
    // For now we assume static list after load.
    getFileHandlers() {
        return this.registry.getFileHandlers();
    }

    getAssociatedApps(ext: string) {
        return this.registry.getAssociatedApps(ext);
    }

    getDefaultAppId(ext: string): string | null {
        const app = this.registry.getDefaultApp(ext);
        return app ? app.id : null;
    }

    setDefaultApp(ext: string, appId: string) {
        this.registry.setDefaultApp(ext, appId);
    }

    addExtension(ext: string) {
        if (!ext) return;
        this.registry.addExtension(ext);
    }

    removeExtension(ext: string) {
        if (confirm(`Remove extension .${ext}?`)) {
            this.registry.removeExtension(ext);
        }
    }

    addAssociation(ext: string, appId: string) {
        if (!appId) return;
        this.registry.addAssociation(ext, appId);
    }

    removeAssociation(ext: string, appId: string) {
        this.registry.removeAssociation(ext, appId);
    }
}
