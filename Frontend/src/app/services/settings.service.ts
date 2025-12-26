import { Injectable, signal, effect } from '@angular/core';

export type BackgroundType = 'image' | 'color';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    // Default gradient
    readonly defaultBackground = 'radial-gradient(circle at 50% 0%, #5e2750 0%, #2c001e 60%, #2c001e 100%)';

    // Signals
    backgroundImage = signal<string | null>(localStorage.getItem('backgroundImage'));
    backgroundColor = signal<string>(localStorage.getItem('backgroundColor') || '#2c001e');
    backgroundType = signal<BackgroundType>((localStorage.getItem('backgroundType') as BackgroundType) || 'color');

    constructor() {
        // Persistence effects
        effect(() => {
            const bgImage = this.backgroundImage();
            if (bgImage) {
                localStorage.setItem('backgroundImage', bgImage);
            } else {
                localStorage.removeItem('backgroundImage');
            }
        });

        effect(() => {
            localStorage.setItem('backgroundColor', this.backgroundColor());
        });

        effect(() => {
            localStorage.setItem('backgroundType', this.backgroundType());
        });
    }

    setBackgroundImage(url: string) {
        this.backgroundImage.set(url);
        this.backgroundType.set('image');
    }

    setBackgroundColor(color: string) {
        this.backgroundColor.set(color);
        this.backgroundType.set('color');
    }

    setBackgroundType(type: BackgroundType) {
        this.backgroundType.set(type);
    }

    getBackgroundStyle() {
        if (this.backgroundType() === 'image' && this.backgroundImage()) {
            return {
                'background-image': `url(${this.backgroundImage()})`,
                'background-size': 'cover',
                'background-position': 'center'
            };
        } else if (this.backgroundType() === 'color') {
            // If it's the default gradient color/setup, we might want to return that
            // But here we are allowing simple solid colors. 
            // If the user hasn't set anything special, we might default to the original CSS in the component,
            // but let's make the service authoritative.
            // If the user clears their settings, we might want a way to revert to default.
            // For now, if color is set, use it.
            return {
                'background': this.backgroundColor()
            };
        }
        return {
            'background': this.defaultBackground
        };
    }
}
