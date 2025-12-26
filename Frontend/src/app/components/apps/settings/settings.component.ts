import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, BackgroundType } from '../../../services/settings.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="settings-container">
      <h2>Personalization</h2>
      
      <div class="setting-group">
        <h3>Background</h3>
        
        <div class="radio-group">
          <label>
            <input type="radio" name="bgType" value="color" 
                   [checked]="settings.backgroundType() === 'color'" 
                   (change)="setType('color')">
            Solid Color
          </label>
          <label>
            <input type="radio" name="bgType" value="image" 
                   [checked]="settings.backgroundType() === 'image'" 
                   (change)="setType('image')">
            Image
          </label>
        </div>

        <div class="control-area">
          @if (settings.backgroundType() === 'color') {
            <div class="color-picker">
              <label for="bgColor">Pick a color:</label>
              <input type="color" id="bgColor" 
                     [value]="settings.backgroundColor()" 
                     (input)="onColorChange($event)">
            </div>
          } @else {
            <div class="image-uploader">
              <label for="bgImage" class="upload-btn">
                <i class="fa-solid fa-upload"></i> Upload Image
              </label>
              <input type="file" id="bgImage" accept="image/*" (change)="onFileSelected($event)" hidden>
              
              @if (settings.backgroundImage()) {
                <div class="preview">
                  <p>Current Image:</p>
                  <img [src]="settings.backgroundImage()" alt="Background Preview">
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
    styles: [`
    .settings-container {
      padding: 20px;
      color: #333;
      height: 100%;
      overflow-y: auto;
    }

    h2 {
      margin-top: 0;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .setting-group {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
    }

    h3 {
      margin-top: 0;
      font-size: 1.1em;
    }

    .radio-group {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }

    .radio-group label {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .control-area {
      min-height: 100px;
    }

    .color-picker {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .upload-btn {
      display: inline-block;
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .upload-btn:hover {
      background-color: #0056b3;
    }

    .preview {
      margin-top: 15px;
    }

    .preview img {
      max-width: 200px;
      max-height: 150px;
      border-radius: 4px;
      border: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class SettingsComponent {
    settings = inject(SettingsService);

    setType(type: BackgroundType) {
        this.settings.setBackgroundType(type);
    }

    onColorChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.settings.setBackgroundColor(input.value);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const result = e.target?.result as string;
                this.settings.setBackgroundImage(result);
            };

            reader.readAsDataURL(file);
        }
    }
}
