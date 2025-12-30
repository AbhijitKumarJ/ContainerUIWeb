import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8000/api/wallpapers';

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

    getWallpapers() {
        return this.http.get<{ wallpapers: string[] }>(`${this.apiUrl}/list`);
    }

    uploadWallpaper(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ filename: string, url: string }>(`${this.apiUrl}/upload`, formData);
    }

    addWallpaperFromPath(path: string) {
        return this.http.post<{ success: boolean, url: string }>(`${this.apiUrl}/add`, { path });
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
            // If the URL is relative (starts with /), prepend backend URL if needed? 
            // Actually, if it's served via proxy or same origin, it's fine. 
            // But here we are on localhost:4200 and backend on 8000.
            // We need to resolve the full URL if it's from our backend.
            let url = this.backgroundImage();
            if (url?.startsWith('/wallpapers/')) {
                url = `http://localhost:8000${url}`;
            }

            return {
                'background-image': `url(${url})`,
                'background-size': 'cover',
                'background-position': 'center'
            };
        } else if (this.backgroundType() === 'color') {
            return {
                'background': this.backgroundColor()
            };
        }
        return {
            'background': this.defaultBackground
        };
    }
}
