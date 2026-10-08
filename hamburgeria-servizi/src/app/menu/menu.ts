import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MENU, Piatto } from '../modelli/piatto';
import { OrdineService } from '../services/ordine-service';

@Component({
  selector: 'app-menu',
  imports: [CurrencyPipe],
  templateUrl: './menu.html',
})
export class Menu {
  private readonly ordine = inject(OrdineService);
  readonly piatti = MENU;

  aggiungi(p: Piatto): void {
    this.ordine.aggiungi(p);
  }
  quantitaDi(p: Piatto): number {
    return this.ordine.trova(p.id)?.quantita ?? 0;
  }
}
