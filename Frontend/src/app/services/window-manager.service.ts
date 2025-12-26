import { Injectable, signal, Type, computed } from '@angular/core';
import { WindowConfig } from '../models/window-config.interface';

@Injectable({
    providedIn: 'root'
})
export class WindowManagerService {
    // Signals for Reactive State
    windows = signal<WindowConfig[]>([]);
    activeWindowId = signal<string | null>(null);
    showStartMenu = signal(false);

    private baseZIndex = 100;

    constructor() { }

    toggleStartMenu() {
        this.showStartMenu.update(v => !v);
    }

    openApp(appId: string, component: Type<any>, title: string, icon: string, inputs: Record<string, any> = {}, size?: { width: number, height: number }) {
        // Dynamic Size Logic (80% of screen, max 1000px width)
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const taskbarH = 48;

        let width = Math.min(1000, screenW * 0.8);
        let height = Math.min(700, (screenH - taskbarH) * 0.85);

        if (size) {
            width = size.width;
            height = size.height;
        }

        const newWindow: WindowConfig = {
            id: crypto.randomUUID(),
            title: title,
            icon: icon,
            component: component,
            inputs: inputs,
            zIndex: this.getNextZIndex(),
            isMinimized: false,
            isMaximized: false,
            position: { x: (screenW - width) / 2 + (this.windows().length * 20), y: 50 + (this.windows().length * 20) },
            size: { width, height },
            isActive: true
        };

        this.windows.update(current => [...current, newWindow]);
        this.focusWindow(newWindow.id);
    }

    closeWindow(id: string) {
        this.windows.update(current => current.filter(w => w.id !== id));
        if (this.activeWindowId() === id) {
            this.activeWindowId.set(null);
        }
    }

    minimizeWindow(id: string) {
        this.windows.update(current =>
            current.map(w => w.id === id ? { ...w, isMinimized: true, isActive: false } : w)
        );
        this.activeWindowId.set(null);
    }

    restoreWindow(id: string) {
        this.windows.update(current =>
            current.map(w => w.id === id ? { ...w, isMinimized: false } : w)
        );
        this.focusWindow(id);
    }

    toggleMaximize(id: string) {
        this.windows.update(current =>
            current.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)
        );
        this.focusWindow(id);
    }

    focusWindow(id: string) {
        this.activeWindowId.set(id);
        this.windows.update(current =>
            current.map(w => {
                if (w.id === id) {
                    return { ...w, zIndex: this.getNextZIndex(), isActive: true, isMinimized: false };
                }
                return { ...w, isActive: false };
            })
        );
    }

    updateWindowPosition(id: string, x: number, y: number) {
        this.windows.update(current =>
            current.map(w => w.id === id ? { ...w, position: { x, y } } : w)
        );
    }

    updateWindowSize(id: string, width: number, height: number) {
        this.windows.update(current =>
            current.map(w => w.id === id ? { ...w, size: { width, height } } : w)
        );
    }

    private getNextZIndex(): number {
        this.baseZIndex++;
        return this.baseZIndex;
    }

    async openFileDialog(config: { mode: 'open' | 'save', filters?: string[], initialPath?: string[], defaultFileName?: string }): Promise<{ path: string[], fileName: string } | null> {
        return new Promise((resolve) => {
            const id = crypto.randomUUID();
            const width = 600;
            const height = 400;
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;

            const newWindow: WindowConfig = {
                id: id,
                title: config.mode === 'save' ? 'Save As...' : 'Open File',
                icon: config.mode === 'save' ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-folder-open',
                component: null as any, // Will be lazy loaded or circular dependency if direct import. 
                // Alternatively, we can use a registry or just import the component here (circular dep risk if component imports service).
                // Actually FilePickerDialogComponent imports FileSystemService, not WindowManagerService directly (except for my previous thought).
                // But let's check imports. FilePickerDialogComponent imports FileSystemService.
                // WindowManagerService is imported by DesktopComponent.
                // We can import FilePickerDialogComponent here.
                inputs: {
                    mode: config.mode,
                    filters: config.filters || [],
                    initialPath: config.initialPath || [],
                    defaultFileName: config.defaultFileName || ''
                },
                zIndex: this.getNextZIndex() + 100, // Make sure it's on top
                isMinimized: false,
                isMaximized: false,
                position: { x: (screenW - width) / 2, y: (screenH - height) / 2 },
                size: { width, height },
                isActive: true
            };

            // We need to attach the Component Type. 
            // To avoid circular dependency issues if any, we better do it dynamically or simple import if safe.
            // FilePickerDialog doesn't use WindowManagerService in constructor. Safe to import.

            import('../components/shared/file-picker-dialog/file-picker-dialog.component')
                .then(m => {
                    newWindow.component = m.FilePickerDialogComponent;

                    // Hook into outputs?
                    // WindowFrameComponent renders dynamic component. 
                    // We need a way to listen to outputs. 
                    // The standard Dynamic Component Loader in Angular doesn't easily bind outputs from config.
                    // However, we can inject a "DialogRef" or similar into the component, OR we can pass callbacks in inputs.

                    // Let's use the 'inputs' as callbacks approach which is supported if we manually wire it in WindowFrame 
                    // OR we can't easily do it without modifying WindowFrame to support outputs.

                    // Easier hack: Pass a Subject or functions in 'inputs' that the component calls.
                    // But standard Angular Inputs are data. 

                    // Let's modify the component to accept a "callback" input function wrapper? 
                    // No, Signal inputs are read-only.

                    // Strategy: 
                    // 1. Pass a "DialogContext" object in inputs. 
                    // 2. Component calls methods on this context.

                    const context = {
                        confirm: (result: any) => {
                            this.closeWindow(id);
                            resolve(result);
                        },
                        cancel: () => {
                            this.closeWindow(id);
                            resolve(null);
                        }
                    };

                    newWindow.inputs = { ...newWindow.inputs, context };

                    this.windows.update(current => [...current, newWindow]);
                    this.focusWindow(id);
                });
        });
    }
}
