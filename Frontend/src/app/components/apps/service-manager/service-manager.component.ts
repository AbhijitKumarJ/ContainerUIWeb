import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ServiceManagerService, ServiceInfo } from '../../../services/service-manager.service';

@Component({
  selector: 'app-service-manager',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="sm-container">
      @if (errorMsg()) {
        <div class="alert alert-warning alert-dismissible fade show m-2" role="alert">
          <i class="fa-solid fa-triangle-exclamation me-2"></i>
          {{ errorMsg() }}
          <button type="button" class="btn-close" (click)="errorMsg.set('')" aria-label="Close"></button>
        </div>
      }
      <div class="header">
        <div class="d-flex align-items-center">
            <h5 class="mb-0 me-3">System Services</h5>
            <input type="text" [(ngModel)]="filterQuery" placeholder="Filter services..." class="form-control form-control-sm" style="width: 250px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);">
        </div>
        <button class="btn btn-sm btn-outline-light" (click)="refresh()" [disabled]="loading()">Refresh</button>
      </div>

      <div class="table-responsive">
        <table class="table table-dark table-striped table-hover table-sm">
          <thead>
            <tr>
              <th (click)="toggleSort('name')" style="cursor: pointer">Name <i [class]="getSortIcon('name')"></i></th>
              <th (click)="toggleSort('display_name')" style="cursor: pointer">Display Name <i [class]="getSortIcon('display_name')"></i></th>
              <th (click)="toggleSort('status')" style="cursor: pointer">Status <i [class]="getSortIcon('status')"></i></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (svc of filteredServices(); track svc.name) {
              <tr>
                <td>{{ svc.name }}</td>
                <td>{{ svc.display_name }}</td>
                <td>
                    <span class="badge" [ngClass]="{'bg-success': svc.status === 'running', 'bg-danger': svc.status === 'stopped', 'bg-warning': svc.status === 'paused'}">
                        {{ svc.status | titlecase }}
                    </span>
                </td>
                <td class="actions">
                  <button class="btn btn-icon btn-sm text-success" title="Start" 
                    (click)="control(svc.name, 'start')" [disabled]="svc.status === 'running' || processing()">
                    <i class="fa-solid fa-play"></i>
                  </button>
                  <button class="btn btn-icon btn-sm text-danger" title="Stop" 
                    (click)="control(svc.name, 'stop')" [disabled]="svc.status !== 'running' || processing()">
                    <i class="fa-solid fa-stop"></i>
                  </button>
                  <button class="btn btn-icon btn-sm text-warning" title="Restart" 
                    (click)="control(svc.name, 'restart')" [disabled]="processing()">
                    <i class="fa-solid fa-rotate-right"></i>
                  </button>
                </td>
              </tr>
            }
            @if (filteredServices().length === 0 && !loading()) {
               <tr><td colspan="4" class="text-center">No services found</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (loading()) {
        <div class="text-center mt-2">Loading services...</div>
      }
    </div>
  `,
  styles: [`
    .sm-container {
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
    
    .btn-icon {
        background: transparent;
        border: none;
        padding: 0 5px;
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &:hover:not(:disabled) { transform: scale(1.2); }
    }
    
    .actions {
        white-space: nowrap;
    }
  `]
})
export class ServiceManagerComponent implements OnInit {
  services = signal<ServiceInfo[]>([]);
  loading = signal<boolean>(false);
  processing = signal<boolean>(false); // Global processing lock for actions
  errorMsg = signal<string>('');

  // Sorting and Filtering
  sortColumn = signal<keyof ServiceInfo>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  filterQuery = signal<string>('');

  filteredServices = computed(() => {
    const svcs = this.services();
    const query = this.filterQuery().toLowerCase();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    let result = svcs;

    // Filter
    if (query) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.display_name.toLowerCase().includes(query)
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

  constructor(private serviceManager: ServiceManagerService) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.errorMsg.set(''); // Clear previous errors
    this.serviceManager.list().subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load services', err);
        this.loading.set(false);
        this.errorMsg.set('Failed to list services. Make sure the backend is running with Administrative privileges (Run as Administrator).');
      }
    });
  }

  control(name: string, action: 'start' | 'stop' | 'restart') {
    if (this.processing()) return;
    this.processing.set(true);

    let obs;
    if (action === 'start') obs = this.serviceManager.start(name);
    else if (action === 'stop') obs = this.serviceManager.stop(name);
    else obs = this.serviceManager.restart(name);

    obs.subscribe({
      next: () => {
        this.refresh(); // Status change needs refresh
        this.processing.set(false);
      },
      error: (err) => {
        console.error(`Failed to ${action} service`, err);
        alert(`Failed to ${action} service: ${err.error?.detail || 'Unknown error'}`);
        this.processing.set(false);
      }
    });
  }

  toggleSort(column: keyof ServiceInfo) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: keyof ServiceInfo) {
    if (this.sortColumn() !== column) return 'fa-solid fa-sort';
    return this.sortDirection() === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
  }
}
