import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppRegistryService } from './app-registry.service';
import { ExtensionLoaderComponent } from '../components/os/extension-loader/extension-loader.component';

interface Extension {
    id: string;
    name: string;
    version: string;
    icon?: string;
    url: string;
    defaultSize?: { width: number, height: number };
    supports?: string[]; // From valid manifest
    // New fields
    IsFileHandler?: boolean;
    AssociatedFileExtensions?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ExtensionService {
    http = inject(HttpClient);
    registry = inject(AppRegistryService);
    apiUrl = 'http://localhost:8000/api/extensions';

    loadExtensions() {
        this.refresh();
    }

    refresh() {
        this.http.get<Extension[]>(`${this.apiUrl}/list`).subscribe({
            next: (extensions) => {
                const currentExtIds = new Set(extensions.map(e => e.id));
                const registeredApps = this.registry.getAllApps();

                // 1. Unregister extensions that are no longer present
                // We assume extensions have IDs that don't clash with native apps, or native apps are not in this list.
                // It's safer to track which apps are extensions, but for now we look for difference.
                // Actually, native apps (text-editor, etc) won't be returned by backend /list.
                // So if we have an app in registry that WAS an extension but not in new list... how do we know it was extension?
                // Simplification for now: We won't auto-unregister UNLESS we know it's an extension.
                // Ideally AppRegistry should flag 'isExtension'.
                // But wait, the user wants "unmap on remove".
                // Let's iterate all registered apps. If an app ID is likely an extension (not native) and not in list, remove it.
                // Hardcoded native list? Or check 'component' type (but component is ExtensionLoaderComponent).

                registeredApps.forEach(app => {
                    if (app.component === ExtensionLoaderComponent && !currentExtIds.has(app.id)) {
                        this.registry.unregisterApp(app.id);
                    }
                });

                // 2. Register/Update present extensions
                extensions.forEach(ext => {
                    this.registry.registerApp({
                        id: ext.id,
                        name: ext.name,
                        component: ExtensionLoaderComponent,
                        icon: ext.icon || 'fa-solid fa-puzzle-piece',
                        // Logic: If IsFileHandler is set, use AssociatedFileExtensions or supports
                        supports: ext.AssociatedFileExtensions || ext.supports || [],
                        isFileHandler: ext.IsFileHandler || false,
                        defaultInputs: {
                            url: ext.url,
                            extId: ext.id
                        }
                    });
                });
            },
            error: (err) => console.error('Failed to load extensions', err)
        });
    }
}
