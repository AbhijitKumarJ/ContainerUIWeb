import {
  CommonModule,
  Component,
  DefaultValueAccessor,
  FileSystemService,
  FormsModule,
  NgClass,
  NgControlStatus,
  NgModel,
  NgSelectOption,
  effect,
  inject,
  input,
  output,
  setClassMetadata,
  signal,
  ɵNgSelectMultipleOption,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-L22HG6HE.js";

// src/app/components/shared/file-picker-dialog/file-picker-dialog.component.ts
var _forTrack0 = ($index, $item) => $item.name;
function FilePickerDialogComponent_For_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 18);
    \u0275\u0275text(1, "/");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 5);
    \u0275\u0275listener("click", function FilePickerDialogComponent_For_8_Template_span_click_2_listener() {
      const $index_r2 = \u0275\u0275restoreView(_r1).$index;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.navigateToIndex($index_r2));
    });
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const part_r4 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(part_r4);
  }
}
function FilePickerDialogComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 10);
    \u0275\u0275text(1, "Loading...");
    \u0275\u0275elementEnd();
  }
}
function FilePickerDialogComponent_Conditional_13_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275listener("click", function FilePickerDialogComponent_Conditional_13_For_2_Template_div_click_0_listener() {
      const file_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.selectFile(file_r6));
    })("dblclick", function FilePickerDialogComponent_Conditional_13_For_2_Template_div_dblclick_0_listener() {
      const file_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onItemDblClick(file_r6));
    });
    \u0275\u0275element(1, "i", 22);
    \u0275\u0275elementStart(2, "span", 23);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_11_0;
    const file_r6 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("selected", ((tmp_11_0 = ctx_r2.selectedFile()) == null ? null : tmp_11_0.name) === file_r6.name);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", file_r6.type === "folder" ? "fa-folder icon-folder" : "fa-file icon-file");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(file_r6.name);
  }
}
function FilePickerDialogComponent_Conditional_13_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 20);
    \u0275\u0275text(1, "Folder is empty");
    \u0275\u0275elementEnd();
  }
}
function FilePickerDialogComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11);
    \u0275\u0275repeaterCreate(1, FilePickerDialogComponent_Conditional_13_For_2_Template, 4, 4, "div", 19, _forTrack0);
    \u0275\u0275template(3, FilePickerDialogComponent_Conditional_13_Conditional_3_Template, 2, 0, "div", 20);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.files());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.files().length === 0 ? 3 : -1);
  }
}
var FilePickerDialogComponent = class _FilePickerDialogComponent {
  // Inputs
  mode = input("open");
  filters = input([]);
  // ['.txt', '.js']
  initialPath = input([]);
  defaultFileName = input("");
  // Context for WindowManager interaction
  context = input(null);
  // Outputs
  fileSelected = output();
  cancel = output();
  // State
  fs = inject(FileSystemService);
  currentPath = signal([]);
  files = signal([]);
  loading = signal(false);
  selectedFile = signal(null);
  fileNameInput = "";
  constructor() {
    effect(() => {
      if (this.defaultFileName()) {
        this.fileNameInput = this.defaultFileName();
      }
    });
  }
  ngOnInit() {
    if (this.initialPath().length > 0) {
      this.currentPath.set(this.initialPath());
    }
    this.refresh();
  }
  refresh() {
    this.loading.set(true);
    this.fs.getFiles(this.currentPath()).subscribe({
      next: (files) => {
        const sorted = files.sort((a, b) => {
          if (a.type === b.type)
            return a.name.localeCompare(b.name);
          return a.type === "folder" ? -1 : 1;
        });
        this.files.set(sorted);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.selectedFile.set(null);
    if (this.mode() === "open") {
      this.fileNameInput = "";
    }
  }
  navigate(path) {
    this.currentPath.set(path);
    this.refresh();
  }
  navigateToIndex(index) {
    this.navigate(this.currentPath().slice(0, index + 1));
  }
  goUp() {
    if (this.currentPath().length > 0) {
      this.navigate(this.currentPath().slice(0, -1));
    }
  }
  selectFile(file) {
    this.selectedFile.set(file);
    if (file.type === "file") {
      this.fileNameInput = file.name;
    }
  }
  onItemDblClick(file) {
    if (file.type === "folder") {
      this.navigate([...this.currentPath(), file.name]);
    } else {
      this.selectFile(file);
      this.confirm();
    }
  }
  confirm() {
    if (!this.fileNameInput)
      return;
    const result = {
      path: this.currentPath(),
      fileName: this.fileNameInput
    };
    const ctx = this.context();
    if (ctx) {
      ctx.confirm(result);
    } else {
      this.fileSelected.emit(result);
    }
  }
  onCancel() {
    const ctx = this.context();
    if (ctx) {
      ctx.cancel();
    } else {
      this.cancel.emit();
    }
  }
  static \u0275fac = function FilePickerDialogComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _FilePickerDialogComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _FilePickerDialogComponent, selectors: [["app-file-picker-dialog"]], inputs: { mode: [1, "mode"], filters: [1, "filters"], initialPath: [1, "initialPath"], defaultFileName: [1, "defaultFileName"], context: [1, "context"] }, outputs: { fileSelected: "fileSelected", cancel: "cancel" }, decls: 30, vars: 4, consts: [[1, "dialog-container"], [1, "toolbar"], [1, "nav-btn", 3, "click", "disabled"], [1, "fa-solid", "fa-arrow-up"], [1, "path-display"], [1, "path-crumb", 3, "click"], [1, "fa-solid", "fa-server"], [1, "refresh-btn", 3, "click"], [1, "fa-solid", "fa-rotate-right"], [1, "file-list-container"], [1, "loading"], [1, "file-list"], [1, "bottom-bar"], [1, "input-group"], ["type", "text", 3, "ngModelChange", "keyup.enter", "ngModel"], ["disabled", ""], [1, "buttons"], [3, "click"], [1, "separator"], [1, "file-item", 3, "selected"], [1, "empty"], [1, "file-item", 3, "click", "dblclick"], [1, "fa-solid", 3, "ngClass"], [1, "name"]], template: function FilePickerDialogComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "button", 2);
      \u0275\u0275listener("click", function FilePickerDialogComponent_Template_button_click_2_listener() {
        return ctx.goUp();
      });
      \u0275\u0275element(3, "i", 3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "div", 4)(5, "span", 5);
      \u0275\u0275listener("click", function FilePickerDialogComponent_Template_span_click_5_listener() {
        return ctx.navigate([]);
      });
      \u0275\u0275element(6, "i", 6);
      \u0275\u0275elementEnd();
      \u0275\u0275repeaterCreate(7, FilePickerDialogComponent_For_8_Template, 4, 1, null, null, \u0275\u0275repeaterTrackByIndex);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "button", 7);
      \u0275\u0275listener("click", function FilePickerDialogComponent_Template_button_click_9_listener() {
        return ctx.refresh();
      });
      \u0275\u0275element(10, "i", 8);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "div", 9);
      \u0275\u0275template(12, FilePickerDialogComponent_Conditional_12_Template, 2, 0, "div", 10)(13, FilePickerDialogComponent_Conditional_13_Template, 4, 1, "div", 11);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "div", 12)(15, "div", 13)(16, "label");
      \u0275\u0275text(17, "File name:");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "input", 14);
      \u0275\u0275twoWayListener("ngModelChange", function FilePickerDialogComponent_Template_input_ngModelChange_18_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.fileNameInput, $event) || (ctx.fileNameInput = $event);
        return $event;
      });
      \u0275\u0275listener("keyup.enter", function FilePickerDialogComponent_Template_input_keyup_enter_18_listener() {
        return ctx.confirm();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(19, "div", 13)(20, "label");
      \u0275\u0275text(21, "Type:");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "select", 15)(23, "option");
      \u0275\u0275text(24, "All Files (*.*)");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(25, "div", 16)(26, "button", 17);
      \u0275\u0275listener("click", function FilePickerDialogComponent_Template_button_click_26_listener() {
        return ctx.confirm();
      });
      \u0275\u0275text(27);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "button", 17);
      \u0275\u0275listener("click", function FilePickerDialogComponent_Template_button_click_28_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(29, "Cancel");
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(2);
      \u0275\u0275property("disabled", ctx.currentPath().length === 0);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.currentPath());
      \u0275\u0275advance(5);
      \u0275\u0275conditional(ctx.loading() ? 12 : 13);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.fileNameInput);
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(ctx.mode() === "save" ? "Save" : "Open");
    }
  }, dependencies: [CommonModule, NgClass, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NgControlStatus, NgModel], styles: ['\n\n.dialog-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  background: #f0f0f0;\n  color: #333;\n  font-family: "Segoe UI", sans-serif;\n}\n.toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  padding: 10px;\n  background: white;\n  border-bottom: 1px solid #ccc;\n  align-items: center;\n}\n.nav-btn[_ngcontent-%COMP%], \n.refresh-btn[_ngcontent-%COMP%] {\n  border: 1px solid #ccc;\n  background: #f9f9f9;\n  padding: 5px 10px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n[_ngcontent-%COMP%]:is(.nav-btn, .refresh-btn):hover {\n  background: #e0e0e0;\n}\n[_ngcontent-%COMP%]:is(.nav-btn, .refresh-btn):disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n.path-display[_ngcontent-%COMP%] {\n  flex: 1;\n  border: 1px solid #ccc;\n  padding: 4px 8px;\n  background: white;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  white-space: nowrap;\n}\n.path-crumb[_ngcontent-%COMP%] {\n  cursor: pointer;\n  padding: 0 4px;\n}\n.path-crumb[_ngcontent-%COMP%]:hover {\n  background: #eee;\n  border-radius: 2px;\n}\n.separator[_ngcontent-%COMP%] {\n  color: #888;\n}\n.file-list-container[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  background: white;\n  margin: 10px;\n  border: 1px solid #ccc;\n}\n.file-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n.file-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 5px 10px;\n  cursor: pointer;\n}\n.file-item[_ngcontent-%COMP%]:hover {\n  background: #e8f0fe;\n}\n.file-item.selected[_ngcontent-%COMP%] {\n  background: #cce8ff;\n  border: 1px solid #99d1ff;\n  padding: 4px 9px;\n}\n.file-item[_ngcontent-%COMP%]   .icon-folder[_ngcontent-%COMP%] {\n  color: #dcb67a;\n}\n.file-item[_ngcontent-%COMP%]   .icon-file[_ngcontent-%COMP%] {\n  color: #555;\n}\n.bottom-bar[_ngcontent-%COMP%] {\n  padding: 10px;\n  background: #f0f0f0;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  border-top: 1px solid #ccc;\n}\n.input-group[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.input-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  width: 70px;\n  text-align: right;\n  font-size: 0.9em;\n}\n.input-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.input-group[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 4px;\n  border: 1px solid #ccc;\n  border-radius: 3px;\n}\n.buttons[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  margin-top: 5px;\n}\n.buttons[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  padding: 6px 20px;\n  cursor: pointer;\n  border: 1px solid #aaa;\n  border-radius: 4px;\n  min-width: 80px;\n}\n.buttons[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:first-child {\n  background: #0078d4;\n  color: white;\n  border-color: #005a9e;\n}\n.buttons[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:first-child:hover {\n  background: #106ebe;\n}\n.buttons[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:last-child {\n  background: white;\n}\n.buttons[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:last-child:hover {\n  background: #f0f0f0;\n}\n.loading[_ngcontent-%COMP%], \n.empty[_ngcontent-%COMP%] {\n  padding: 20px;\n  text-align: center;\n  color: #888;\n}\n/*# sourceMappingURL=file-picker-dialog.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FilePickerDialogComponent, [{
    type: Component,
    args: [{ selector: "app-file-picker-dialog", standalone: true, imports: [CommonModule, FormsModule], template: `
    <div class="dialog-container">
      <!-- Toolbar / Navigation -->
      <div class="toolbar">
        <button class="nav-btn" (click)="goUp()" [disabled]="currentPath().length === 0">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
        <div class="path-display">
            <span (click)="navigate([])" class="path-crumb"><i class="fa-solid fa-server"></i></span>
            @for (part of currentPath(); track $index) {
                <span class="separator">/</span>
                <span (click)="navigateToIndex($index)" class="path-crumb">{{part}}</span>
            }
        </div>
        <button class="refresh-btn" (click)="refresh()">
            <i class="fa-solid fa-rotate-right"></i>
        </button>
      </div>

      <!-- File List -->
      <div class="file-list-container">
        @if (loading()) {
            <div class="loading">Loading...</div>
        } @else {
            <div class="file-list">
                <!-- Folders first -->
                @for (file of files(); track file.name) {
                    <div class="file-item" 
                         [class.selected]="selectedFile()?.name === file.name"
                         (click)="selectFile(file)"
                         (dblclick)="onItemDblClick(file)"
                         >
                        <i class="fa-solid" [ngClass]="file.type === 'folder' ? 'fa-folder icon-folder' : 'fa-file icon-file'"></i>
                        <span class="name">{{file.name}}</span>
                    </div>
                }
                @if (files().length === 0) {
                    <div class="empty">Folder is empty</div>
                }
            </div>
        }
      </div>

      <!-- Bottom Bar -->
      <div class="bottom-bar">
        <div class="input-group">
            <label>File name:</label>
            <input type="text" [(ngModel)]="fileNameInput" (keyup.enter)="confirm()">
        </div>
        <div class="input-group">
            <label>Type:</label>
            <select disabled>
                <option>All Files (*.*)</option>
            </select>
        </div>
        
        <div class="buttons">
            <button (click)="confirm()">{{ mode() === 'save' ? 'Save' : 'Open' }}</button>
            <button (click)="onCancel()">Cancel</button>
        </div>
      </div>
    </div>
  `, styles: ['/* angular:styles/component:css;b6ec4c8919744f013b502657d79dcc44059f5216c9e394e9fad08d342a7557ab;/home/abhijit/Documents/ghrepos/ContainerUIWeb/Frontend/src/app/components/shared/file-picker-dialog/file-picker-dialog.component.ts */\n.dialog-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  background: #f0f0f0;\n  color: #333;\n  font-family: "Segoe UI", sans-serif;\n}\n.toolbar {\n  display: flex;\n  gap: 10px;\n  padding: 10px;\n  background: white;\n  border-bottom: 1px solid #ccc;\n  align-items: center;\n}\n.nav-btn,\n.refresh-btn {\n  border: 1px solid #ccc;\n  background: #f9f9f9;\n  padding: 5px 10px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n:is(.nav-btn, .refresh-btn):hover {\n  background: #e0e0e0;\n}\n:is(.nav-btn, .refresh-btn):disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n.path-display {\n  flex: 1;\n  border: 1px solid #ccc;\n  padding: 4px 8px;\n  background: white;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  white-space: nowrap;\n}\n.path-crumb {\n  cursor: pointer;\n  padding: 0 4px;\n}\n.path-crumb:hover {\n  background: #eee;\n  border-radius: 2px;\n}\n.separator {\n  color: #888;\n}\n.file-list-container {\n  flex: 1;\n  overflow-y: auto;\n  background: white;\n  margin: 10px;\n  border: 1px solid #ccc;\n}\n.file-list {\n  display: flex;\n  flex-direction: column;\n}\n.file-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 5px 10px;\n  cursor: pointer;\n}\n.file-item:hover {\n  background: #e8f0fe;\n}\n.file-item.selected {\n  background: #cce8ff;\n  border: 1px solid #99d1ff;\n  padding: 4px 9px;\n}\n.file-item .icon-folder {\n  color: #dcb67a;\n}\n.file-item .icon-file {\n  color: #555;\n}\n.bottom-bar {\n  padding: 10px;\n  background: #f0f0f0;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  border-top: 1px solid #ccc;\n}\n.input-group {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.input-group label {\n  width: 70px;\n  text-align: right;\n  font-size: 0.9em;\n}\n.input-group input,\n.input-group select {\n  flex: 1;\n  padding: 4px;\n  border: 1px solid #ccc;\n  border-radius: 3px;\n}\n.buttons {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  margin-top: 5px;\n}\n.buttons button {\n  padding: 6px 20px;\n  cursor: pointer;\n  border: 1px solid #aaa;\n  border-radius: 4px;\n  min-width: 80px;\n}\n.buttons button:first-child {\n  background: #0078d4;\n  color: white;\n  border-color: #005a9e;\n}\n.buttons button:first-child:hover {\n  background: #106ebe;\n}\n.buttons button:last-child {\n  background: white;\n}\n.buttons button:last-child:hover {\n  background: #f0f0f0;\n}\n.loading,\n.empty {\n  padding: 20px;\n  text-align: center;\n  color: #888;\n}\n/*# sourceMappingURL=file-picker-dialog.component.css.map */\n'] }]
  }], () => [], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(FilePickerDialogComponent, { className: "FilePickerDialogComponent", filePath: "src/app/components/shared/file-picker-dialog/file-picker-dialog.component.ts", lineNumber: 203 });
})();
export {
  FilePickerDialogComponent
};
//# sourceMappingURL=chunk-35CVDBRH.js.map
