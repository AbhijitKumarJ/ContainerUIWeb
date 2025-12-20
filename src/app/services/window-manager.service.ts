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

    openApp(appId: string, component: Type<any>, title: string, icon: string, inputs: Record<string, any> = {}) {
        // Dynamic Size Logic (80% of screen, max 1000px width)
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const taskbarH = 48;

        const width = Math.min(1000, screenW * 0.8);
        const height = Math.min(700, (screenH - taskbarH) * 0.85);

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

    private getNextZIndex(): number {
        this.baseZIndex++;
        return this.baseZIndex;
    }
}
