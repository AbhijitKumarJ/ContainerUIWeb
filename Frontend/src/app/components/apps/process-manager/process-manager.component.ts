import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProcessService, Process } from '../../../services/process.service';

@Component({
  selector: 'app-process-manager',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="pm-container">
      <div class="header">
        <h5>Running Processes</h5>
        <button class="btn btn-sm btn-outline-light" (click)="refresh()" [disabled]="loading()">Refresh</button>
      </div>

      <div class="table-responsive">
        <table class="table table-dark table-striped table-hover table-sm">
          <thead>
            <tr>
              <th>PID</th>
              <th>Name</th>
              <th>User</th>
              <th>CPU</th>
              <th>Mem</th>
            </tr>
          </thead>
          <tbody>
            @for (proc of processes(); track proc.pid) {
              <tr>
                <td>{{ proc.pid }}</td>
                <td>{{ proc.name }}</td>
                <td>{{ proc.username || '-' }}</td>
                <td>{{ proc.cpu_percent.toFixed(1) }}%</td>
                <td>{{ formatBytes(proc.memory_bytes) }}</td>
              </tr>
            }
            @if (processes().length === 0 && !loading()) {
               <tr><td colspan="5" class="text-center">No processes found</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (loading()) {
        <div class="text-center mt-2">Loading processes...</div>
      }
    </div>
  `,
  styles: [`
    .pm-container {
      height: 100%;
      background: #1e1e1e;
      color: #eee;
      padding: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .table-responsive {
        flex: 1;
        overflow-y: auto;
    }

    table {
        margin-bottom: 0;
    }
  `]
})
export class ProcessManagerComponent implements OnInit, OnDestroy {
  processes = signal<Process[]>([]);
  loading = signal<boolean>(false);
  private intervalId: any;

  constructor(private processService: ProcessService) { }

  ngOnInit() {
    this.refresh();
    // Auto refresh every 5 seconds
    this.intervalId = setInterval(() => {
      this.loadProcesses(true); // silent refresh
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  refresh() {
    this.loadProcesses(false);
  }

  loadProcesses(silent: boolean) {
    if (!silent) this.loading.set(true);

    this.processService.list().subscribe({
      next: (data) => {
        this.processes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load processes', err);
        this.loading.set(false);
      }
    });
  }

  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
