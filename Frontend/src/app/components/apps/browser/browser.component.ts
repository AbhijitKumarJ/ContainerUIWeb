import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-browser',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="browser-container">
      <div class="toolbar">
        <button class="nav-btn" (click)="refresh()"><i class="fa-solid fa-rotate-right"></i></button>
        <button class="nav-btn" (click)="goHome()"><i class="fa-solid fa-house"></i></button>
        <div class="address-bar">
          <input type="text" [(ngModel)]="urlStats.inputValue" (keydown.enter)="navigate()">
        </div>
        <button class="nav-btn menu"><i class="fa-solid fa-ellipsis-vertical"></i></button>
      </div>
      
      <div class="content">
        @if (currentUrlSafe) {
          <iframe [src]="currentUrlSafe" frameborder="0"></iframe>
        } @else {
          <div class="placeholder">
            <i class="fa-solid fa-earth-americas"></i>
            <p>Enter a URL to browse.</p>
            <p class="note">Note: Many sites block iframe embedding (X-Frame-Options).</p>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .browser-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #fff;
    }

    .toolbar {
      display: flex;
      gap: 8px;
      padding: 8px;
      background: #f0f0f0;
      border-bottom: 1px solid #ccc;
      align-items: center;

      .nav-btn {
        background: transparent;
        border: none;
        color: #5f6368;
        padding: 6px;
        border-radius: 50%;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover { background: #e0e0e0; color: #000; }
      }

      .address-bar {
        flex: 1;
        background: #fff;
        border: 1px solid #ccc; /* Flat border */
        border-radius: 20px;
        padding: 0 15px;
        height: 32px;
        display: flex;
        align-items: center;

        input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 0.9rem;
          color: #333;
        }
      }
    }

    .content {
      flex: 1;
      position: relative;
      background: #fff;
      
      iframe {
        width: 100%;
        height: 100%;
      }

      .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #ccc;
        
        i { font-size: 4rem; margin-bottom: 20px; color: #e0e0e0; }
        p { font-size: 1.2rem; color: #888; }
        .note { font-size: 0.8rem; color: #aaa; margin-top: 10px; }
      }
    }
  `]
})
export class BrowserComponent {
    urlStats = { inputValue: 'https://www.wikipedia.org' };
    currentUrlSafe: SafeResourceUrl | null = null;

    constructor(private sanitizer: DomSanitizer) {
        this.navigate();
    }

    navigate() {
        let url = this.urlStats.inputValue.trim();
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        this.urlStats.inputValue = url; // Normalise
        this.currentUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    refresh() {
        const current = this.currentUrlSafe;
        this.currentUrlSafe = null;
        setTimeout(() => this.currentUrlSafe = current, 0);
    }

    goHome() {
        this.urlStats.inputValue = 'https://www.wikipedia.org';
        this.navigate();
    }
}
