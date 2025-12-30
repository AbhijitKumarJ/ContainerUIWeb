import { Injectable, signal, Type, effect } from '@angular/core';

export interface AppDefinition {
    id: string;
    name: string;
    component: Type<any>;
    icon: string;
    description?: string;
    supports: string[]; // List of extensions the app claims to support
    isFileHandler?: boolean; // Can this app open files?
    defaultInputs?: Record<string, any>;
}

export interface AssociationConfig {
    defaultAppId: string | null;
    associatedAppIds: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AppRegistryService {

    private apps = new Map<string, AppDefinition>();
    // Map of extension (e.g. 'txt') to its configuration
    private associations = signal<Map<string, AssociationConfig>>(new Map());

    constructor() {
        this.loadAssociations();

        effect(() => {
            const obj = Object.fromEntries(this.associations());
            localStorage.setItem('fileAssociations_v2', JSON.stringify(obj));
        });
    }

    private loadAssociations() {
        const saved = localStorage.getItem('fileAssociations_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Convert object back to Map
                const map = new Map<string, AssociationConfig>();
                Object.entries(parsed).forEach(([ext, config]: [string, any]) => {
                    map.set(ext, config);
                });
                this.associations.set(map);
            } catch (e) {
                console.error('Failed to load v2 associations', e);
            }
        }
    }

    registerApp(app: AppDefinition) {
        if (!this.apps.has(app.id)) {
            this.apps.set(app.id, app);

            // Auto-associate with supported extensions if not already present
            if (app.isFileHandler) {
                app.supports.forEach(ext => {
                    const cleanExt = this.normalizeExt(ext);
                    if (cleanExt !== '*') {
                        this.addAssociation(cleanExt, app.id, false); // Don't force override default unless logic dictates? 
                        // For now, just add to associated list.

                        // Optional: If no default exists for this ext, set this app as default?
                        // This mimics "installing a new app takes over or adds to options"
                        this.associations.update(current => {
                            const map = new Map(current);
                            const config = map.get(cleanExt) || { defaultAppId: null, associatedAppIds: [] };
                            if (!config.defaultAppId) {
                                config.defaultAppId = app.id;
                                map.set(cleanExt, config);
                            }
                            return map;
                        });
                    }
                });
            }
        }
    }

    getApp(appId: string): AppDefinition | undefined {
        return this.apps.get(appId);
    }

    getAllApps(): AppDefinition[] {
        return Array.from(this.apps.values());
    }

    getFileHandlers(): AppDefinition[] {
        return Array.from(this.apps.values()).filter(app => app.isFileHandler);
    }

    // Get the configured default app for an extension
    getDefaultApp(extension: string): AppDefinition | undefined {
        const ext = this.normalizeExt(extension);
        const config = this.associations().get(ext);

        if (config?.defaultAppId) {
            return this.apps.get(config.defaultAppId);
        }

        // Fallback: If no explicit default, use first associated?
        if (config?.associatedAppIds.length && config.associatedAppIds.length > 0) {
            return this.apps.get(config.associatedAppIds[0]);
        }

        return undefined;
    }

    // Get all apps associated with this extension (for Open With menu)
    getAssociatedApps(extension: string): AppDefinition[] {
        const ext = this.normalizeExt(extension);
        const config = this.associations().get(ext);

        if (!config) return [];

        return config.associatedAppIds
            .map(id => this.apps.get(id))
            .filter((app): app is AppDefinition => !!app);
    }

    // Get raw config keys (all known extensions)
    getConfiguredExtensions(): string[] {
        return Array.from(this.associations().keys()).sort();
    }

    // Get raw config for UI
    getAssociationConfig(extension: string): AssociationConfig | undefined {
        return this.associations().get(this.normalizeExt(extension));
    }

    // --- Management Methods ---

    addExtension(extension: string) {
        const ext = this.normalizeExt(extension);
        this.associations.update(map => {
            if (map.has(ext)) return map;
            const newMap = new Map(map);
            newMap.set(ext, { defaultAppId: null, associatedAppIds: [] });
            return newMap;
        });
    }

    removeExtension(extension: string) {
        const ext = this.normalizeExt(extension);
        this.associations.update(map => {
            const newMap = new Map(map);
            newMap.delete(ext);
            return newMap;
        });
    }

    addAssociation(extension: string, appId: string, makeDefault = false) {
        const ext = this.normalizeExt(extension);
        this.associations.update(map => {
            const newMap = new Map(map);
            const config = newMap.get(ext) || { defaultAppId: null, associatedAppIds: [] };

            if (!config.associatedAppIds.includes(appId)) {
                config.associatedAppIds = [...config.associatedAppIds, appId];
            }

            if (makeDefault) {
                config.defaultAppId = appId;
            } else if (!config.defaultAppId) {
                // If no default existed, make this one default? 
                // User requirement: "select default from selected program". 
                // Maybe we shouldn't auto-set unless explicit.
            }

            newMap.set(ext, config);
            return newMap;
        });
    }

    removeAssociation(extension: string, appId: string) {
        const ext = this.normalizeExt(extension);
        this.associations.update(map => {
            const newMap = new Map(map);
            const config = newMap.get(ext);
            if (!config) return map;

            config.associatedAppIds = config.associatedAppIds.filter(id => id !== appId);

            if (config.defaultAppId === appId) {
                config.defaultAppId = null; // Clear default if removed
                // Optional: Fallback to next available?
                if (config.associatedAppIds.length > 0) {
                    config.defaultAppId = config.associatedAppIds[0];
                }
            }

            newMap.set(ext, config);
            return newMap;
        });
    }

    unregisterApp(appId: string) {
        if (this.apps.has(appId)) {
            this.apps.delete(appId);

            // Clean up associations
            this.associations.update(map => {
                const newMap = new Map(map);
                for (const [ext, config] of newMap.entries()) {
                    if (config.associatedAppIds.includes(appId)) {
                        config.associatedAppIds = config.associatedAppIds.filter(id => id !== appId);

                        if (config.defaultAppId === appId) {
                            config.defaultAppId = null;
                            // Fallback: Use first available associated app
                            if (config.associatedAppIds.length > 0) {
                                config.defaultAppId = config.associatedAppIds[0];
                            }
                        }
                        newMap.set(ext, config); // Update the config in map
                    }
                }
                return newMap;
            });
        }
    }

    setDefaultApp(extension: string, appId: string | null) {
        const ext = this.normalizeExt(extension);
        this.associations.update(map => {
            const newMap = new Map(map);
            const config = newMap.get(ext);
            if (!config) return map; // Should verify extension exists first?

            config.defaultAppId = appId;
            newMap.set(ext, config);
            return newMap;
        });
    }

    private normalizeExt(ext: string): string {
        return ext.toLowerCase().replace(/^\./, '');
    }
}
