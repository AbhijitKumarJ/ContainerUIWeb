import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProcessService, Process } from '../../../services/process.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-process-manager',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="pm-container">
      <div class="header">
        <div class="d-flex align-items-center">
            <h5 class="mb-0 me-3">Running Processes</h5>
            <input type="text" [(ngModel)]="filterQuery" placeholder="Filter by name or user..." class="form-control form-control-sm" style="width: 250px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);">
        </div>
        <button class="btn btn-sm btn-outline-light" (click)="refresh()" [disabled]="loading()">Refresh</button>
      </div>

      <div class="table-responsive">
        <table class="table table-dark table-striped table-hover table-sm">
          <thead>
            <tr>
              <th (click)="toggleSort('pid')" style="cursor: pointer">PID <i [class]="getSortIcon('pid')"></i></th>
              <th (click)="toggleSort('name')" style="cursor: pointer">Name <i [class]="getSortIcon('name')"></i></th>
              <th (click)="toggleSort('username')" style="cursor: pointer">User <i [class]="getSortIcon('username')"></i></th>
              <th (click)="toggleSort('cpu_percent')" style="cursor: pointer">CPU <i [class]="getSortIcon('cpu_percent')"></i></th>
              <th (click)="toggleSort('memory_bytes')" style="cursor: pointer">Mem <i [class]="getSortIcon('memory_bytes')"></i></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (proc of filteredProcesses(); track proc.pid) {
              <tr>
                <td>{{ proc.pid }}</td>
                <td>{{ proc.name }}</td>
                <td>{{ proc.username || '-' }}</td>
                <td>{{ proc.cpu_percent.toFixed(1) }}%</td>
                <td>{{ formatBytes(proc.memory_bytes) }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" (click)="killProcess(proc.pid)">Kill</button>
                </td>
              </tr>
            }
            @if (filteredProcesses().length === 0 && !loading()) {
               <tr><td colspan="6" class="text-center">No processes found</td></tr>
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

  // Sorting and Filtering
  sortColumn = signal<keyof Process>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  filterQuery = signal<string>('');

  filteredProcesses = computed(() => {
    const procs = this.processes();
    const query = this.filterQuery().toLowerCase();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    let result = procs;

    // Filter
    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.username && p.username.toLowerCase().includes(query))
      );
    }

    // Sort
    return result.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];

      if (valA === valB) return 0;

      const comparison = valA > valB ? 1 : -1;
      return dir === 'asc' ? comparison : -comparison;
    });
  });

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

  killProcess(pid: number) {
    if (confirm(`Are you sure you want to terminate process ${pid}?`)) {
      this.processService.kill(pid).subscribe({
        next: () => {
          this.refresh();
        },
        error: (err) => {
          console.error('Failed to kill process', err);
          alert('Failed to kill process');
        }
      });
    }
  }

  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  toggleSort(column: keyof Process) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: keyof Process) {
    if (this.sortColumn() !== column) return 'fa-solid fa-sort';
    return this.sortDirection() === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
  }
}
