import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdineService } from '../services/ordine-service';

@Component({
  selector: 'app-riepilogo',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './riepilogo.html',
})
export class Riepilogo {
  readonly ordine = inject(OrdineService);
}
