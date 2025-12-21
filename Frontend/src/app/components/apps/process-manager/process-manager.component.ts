import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-process-manager',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="pm-container">
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
          <tr>
            <td>1</td>
            <td>systemd</td>
            <td>root</td>
            <td>0.1%</td>
            <td>12MB</td>
          </tr>
          <tr>
            <td>124</td>
            <td>dockerd</td>
            <td>root</td>
            <td>0.5%</td>
            <td>45MB</td>
          </tr>
          <tr>
            <td>1598</td>
            <td>bash</td>
            <td>user</td>
            <td>0.0%</td>
            <td>4MB</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
    styles: [`
    .pm-container {
      height: 100%;
      background: #1e1e1e;
      color: #eee;
      padding: 10px;
      overflow: auto;
    }
  `]
})
export class ProcessManagerComponent { }
