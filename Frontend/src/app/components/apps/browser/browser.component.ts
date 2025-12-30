import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface Bookmark {
  url: string;
  title: string; // For now just the URL or domain
}

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
          <button class="bookmark-btn" (click)="toggleBookmark()" [class.active]="isCurrentUrlBookmarked()">
            <i class="fa-solid fa-star"></i>
          </button>
        </div>
        
        <div class="info-icon" title="Many modern websites (e.g., Google, Skool, YouTube) block themselves from being viewed in this simple browser (X-Frame-Options).">
            <i class="fa-solid fa-circle-info"></i>
        </div>
        
        <div class="menu-container">
            <button class="nav-btn menu" (click)="toggleBookmarksMenu()"><i class="fa-solid fa-bookmark"></i></button>
            @if (showBookmarks()) {
                <div class="bookmarks-dropdown">
                    <h3>Bookmarks</h3>
                    @if (bookmarks().length === 0) {
                        <div class="empty">No bookmarks yet</div>
                    }
                    @for (bm of bookmarks(); track bm.url) {
                        <div class="bookmark-item" (click)="loadBookmark(bm.url)">
                            <div class="bm-info">
                                <i class="fa-solid fa-globe"></i>
                                <span class="url">{{bm.title}}</span>
                            </div>
                            <button class="delete-btn" (click)="removeBookmark(bm.url); $event.stopPropagation()">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    }
                </div>
            }
        </div>
      </div>
      
      <div class="content">
        @if (currentUrlSafe) {
          <iframe [src]="currentUrlSafe" frameborder="0"></iframe>
        } @else {
          <div class="placeholder">
            <i class="fa-solid fa-earth-americas"></i>
            <p>Enter a URL to browse.</p>
            <div class="warning-box">
                <strong><i class="fa-solid fa-triangle-exclamation"></i> Limitation</strong>
                <p>Major sites like <b>Google, Skool, Facebook</b> etc. will NOT work here because they block embedding for security.</p>
                <p>Try sites like <b>Wikipedia, Bing, or simple static sites</b>.</p>
            </div>
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
      position: relative; /* For dropdown */

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
        
        &.menu { margin-left: auto; }
      }

      .address-bar {
        flex: 1;
        background: #fff;
        border: 1px solid #ccc; /* Flat border */
        border-radius: 20px;
        padding: 0 10px 0 15px;
        height: 32px;
        display: flex;
        align-items: center;

        input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.9rem;
          color: #333;
        }
        
        .bookmark-btn {
            background: transparent;
            border: none;
            color: #ccc;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            &:hover { color: #aaa; background: #f5f5f5; }
            &.active { color: #fbbc04; }
        }
      }
      
      .info-icon {
        color: #888;
        cursor: help;
        padding: 0 5px;
        &:hover { color: #555; }
      }
      
      .menu-container {
        position: relative;
      }
      
      .bookmarks-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 5px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        width: 300px;
        z-index: 100;
        max-height: 400px;
        overflow-y: auto;
        
        h3 {
            padding: 10px;
            margin: 0;
            border-bottom: 1px solid #eee;
            font-size: 1rem;
            color: #333;
            background: #f9f9f9;
        }
        
        .empty { padding: 20px; text-align: center; color: #888; }
        
        .bookmark-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            
            &:hover { background: #f5f5f5; }
            
            .bm-info {
                display: flex;
                align-items: center;
                gap: 10px;
                overflow: hidden;
                
                i { color: #5f6368; font-size: 0.9em;}
                .url { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.9em; color: #333;}
            }
            
            .delete-btn {
                background: transparent;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 4px;
                opacity: 0; 
                transition: opacity 0.2s;
                
                &:hover { color: #d93025; }
            }
            
            &:hover .delete-btn { opacity: 1; }
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
        
        i.fa-earth-americas { font-size: 4rem; margin-bottom: 20px; color: #e0e0e0; }
        p { font-size: 1.2rem; color: #888; margin: 0 0 20px 0; }
        
        .warning-box {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
            padding: 15px;
            border-radius: 6px;
            max-width: 80%;
            text-align: center;
            font-size: 0.9rem;
            
            strong { display: block; margin-bottom: 8px; font-size: 1rem;}
            p { font-size: 0.9rem; color: #856404; margin: 5px 0; }
        }
      }
    }
  `]
})
export class BrowserComponent {
  urlStats = { inputValue: 'https://www.wikipedia.org' };
  currentUrlSafe: SafeResourceUrl | null = null;
  currentUrlGeneric = signal<string>('');

  bookmarks = signal<Bookmark[]>([]);
  showBookmarks = signal(false);

  constructor(private sanitizer: DomSanitizer) {
    // Load bookmarks
    const saved = localStorage.getItem('browserBookmarks');
    if (saved) {
      try {
        this.bookmarks.set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }

    // Persist bookmarks
    effect(() => {
      localStorage.setItem('browserBookmarks', JSON.stringify(this.bookmarks()));
    });

    this.navigate();
  }

  isCurrentUrlBookmarked = computed(() => {
    const url = this.currentUrlGeneric();
    return this.bookmarks().some(bm => bm.url === url);
  });

  navigate() {
    let url = this.urlStats.inputValue.trim();
    if (!url) return;

    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    this.urlStats.inputValue = url; // Normalise
    this.currentUrlGeneric.set(url);
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

  toggleBookmark() {
    const url = this.currentUrlGeneric();
    if (!url) return;

    if (this.isCurrentUrlBookmarked()) {
      this.removeBookmark(url);
    } else {
      try {
        const urlObj = new URL(url);
        this.addBookmark(url, urlObj.hostname + urlObj.pathname);
      } catch (e) {
        this.addBookmark(url, url);
      }
    }
  }

  addBookmark(url: string, title: string) {
    this.bookmarks.update(current => [...current, { url, title }]);
  }

  removeBookmark(url: string) {
    this.bookmarks.update(current => current.filter(bm => bm.url !== url));
  }

  toggleBookmarksMenu() {
    this.showBookmarks.update(v => !v);
  }

  loadBookmark(url: string) {
    this.urlStats.inputValue = url;
    this.navigate();
    this.showBookmarks.set(false);
  }
}
