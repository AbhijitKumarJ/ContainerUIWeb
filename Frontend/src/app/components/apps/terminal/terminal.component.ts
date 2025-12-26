import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule just in case
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="terminal-container" #terminal></div>`,
  styles: [`
    .terminal-container {
      height: 100%;
      width: 100%;
      background-color: #0c0c0c;
      overflow: hidden;
      display: block;
    }
    
    /* Ensure xterm canvas fits */
    .xterm-viewport {
      overflow-y: auto;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class TerminalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('terminal') terminalDiv!: ElementRef;

  private term!: Terminal;
  private fitAddon!: FitAddon;
  private socket!: WebSocket;
  private resizeObserver!: ResizeObserver;

  ngAfterViewInit() {
    // 1. Initialize xterm.js
    this.term = new Terminal({
      cursorBlink: true,
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#0c0c0c',
        foreground: '#cccccc'
      },
      convertEol: true // Help with some line endings
    });

    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);
    this.term.open(this.terminalDiv.nativeElement);

    // Initial fit
    setTimeout(() => {
      this.fitAddon.fit();
    }, 100);

    // 2. Connect WebSocket
    // Use relative path or configurable
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If running ng serve (4200) and backend (8000), need to point to 8000
    // Assuming backend is at localhost:8000 based on standard setup or proxy
    // If using a proxy config, /api/terminal/ws might work.
    // Let's assume typical local dev environment:
    const backendUrl = 'ws://localhost:8000/api/terminal/ws';

    this.socket = new WebSocket(backendUrl);

    this.socket.onopen = () => {
      // Send initial size
      this.sendResize();
    };

    this.socket.onerror = (error) => {
      this.term.write('\r\n\x1b[31mWebSocket Error\x1b[0m\r\n');
    };

    this.socket.onmessage = (event) => {
      // Write data from backend to xterm
      this.term.write(event.data);
    };

    this.socket.onclose = () => {
      this.term.write('\r\n\x1b[31mConnection closed.\x1b[0m\r\n');
    };

    // 3. Handle Input (xterm -> backend)
    this.term.onData((data) => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(data);
      }
    });

    // 4. Handle Resizing
    this.resizeObserver = new ResizeObserver(() => {
      this.fitAddon.fit();
      this.sendResize();
    });
    this.resizeObserver.observe(this.terminalDiv.nativeElement);
  }

  sendResize() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const dims = this.fitAddon.proposeDimensions();
      if (dims) {
        this.socket.send(`__RESIZE__:${dims.cols}:${dims.rows}`);
      }
    }
  }

  ngOnDestroy() {
    if (this.socket) this.socket.close();
    if (this.term) this.term.dispose();
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
