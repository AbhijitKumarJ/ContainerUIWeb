import { ExtensionService } from './services/extension.service';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  extService = inject(ExtensionService);

  constructor() {
    this.extService.loadExtensions();
  }
}
