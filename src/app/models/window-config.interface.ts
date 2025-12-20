import { Type } from '@angular/core';

export interface WindowConfig {
    id: string;
    title: string;
    icon: string;
    component: Type<any>;
    inputs?: Record<string, any>;
    zIndex: number;
    isMinimized: boolean;
    isMaximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isActive: boolean;
}
