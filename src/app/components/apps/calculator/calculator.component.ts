import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-calculator',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="calc-container">
      <div class="display">
        <div class="history">{{ history() }}</div>
        <div class="current">{{ display() }}</div>
      </div>
      <div class="keypad">
        <button class="btn fn" (click)="clear()">AC</button>
        <button class="btn fn" (click)="delete()">DEL</button>
        <button class="btn fn" (click)="op('%')">%</button>
        <button class="btn op" (click)="op('/')">÷</button>
        
        <button class="btn" (click)="num('7')">7</button>
        <button class="btn" (click)="num('8')">8</button>
        <button class="btn" (click)="num('9')">9</button>
        <button class="btn op" (click)="op('*')">×</button>
        
        <button class="btn" (click)="num('4')">4</button>
        <button class="btn" (click)="num('5')">5</button>
        <button class="btn" (click)="num('6')">6</button>
        <button class="btn op" (click)="op('-')">−</button>
        
        <button class="btn" (click)="num('1')">1</button>
        <button class="btn" (click)="num('2')">2</button>
        <button class="btn" (click)="num('3')">3</button>
        <button class="btn op" (click)="op('+')">+</button>
        
        <button class="btn zero" (click)="num('0')">0</button>
        <button class="btn" (click)="num('.')">.</button>
        <button class="btn eq" (click)="calc()">=</button>
      </div>
    </div>
  `,
    styles: [`
    .calc-container {
      height: 100%;
      background: #202020;
      display: flex;
      flex-direction: column;
      padding: 10px;
    }

    .display {
      background: #000;
      color: white;
      text-align: right;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 10px;
      
      .history { color: #888; font-size: 0.9rem; min-height: 1.2em; }
      .current { font-size: 2.5rem; font-weight: 300; }
    }

    .keypad {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;

      .btn {
        border: none;
        border-radius: 50%; /* Circle buttons like Ubuntu/iOS */
        font-size: 1.2rem;
        cursor: pointer;
        background: #333;
        color: white;
        transition: filter 0.2s;

        &:hover { filter: brightness(1.2); }
        &:active { filter: brightness(0.9); }
      }

      .op { background: #e95420; } /* Ubuntu Orange */
      .fn { background: #555; }
      
      .zero {
        grid-column: span 2;
        border-radius: 40px; /* Capsule */
      }
      
      .eq {
        background: #e95420;
      }
    }
  `]
})
export class CalculatorComponent {
    display = signal('0');
    history = signal('');

    private firstOperand: number | null = null;
    private operator: string | null = null;
    private waitingForSecondOperand = false;

    num(val: string) {
        if (this.waitingForSecondOperand) {
            this.display.set(val);
            this.waitingForSecondOperand = false;
        } else {
            this.display.update(d => d === '0' ? val : d + val);
        }
    }

    op(op: string) {
        const inputValue = parseFloat(this.display());

        if (this.firstOperand === null) {
            this.firstOperand = inputValue;
        } else if (this.operator) {
            const result = this.perform(this.operator, this.firstOperand, inputValue);
            this.display.set(String(result));
            this.firstOperand = result;
        }

        this.waitingForSecondOperand = true;
        this.operator = op;
        this.history.set(`${this.firstOperand} ${op}`);
    }

    calc() {
        if (!this.operator || this.firstOperand === null) return;

        const secondOperand = parseFloat(this.display());
        const result = this.perform(this.operator, this.firstOperand, secondOperand);

        this.history.set(`${this.firstOperand} ${this.operator} ${secondOperand} =`);
        this.display.set(String(result));

        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = true;
    }

    perform(op: string, first: number, second: number): number {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return first / second;
            case '%': return first % second;
            default: return second;
        }
    }

    clear() {
        this.display.set('0');
        this.history.set('');
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
    }

    delete() {
        this.display.update(d => d.length > 1 ? d.slice(0, -1) : '0');
    }
}
