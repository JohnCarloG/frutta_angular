import { Routes } from '@angular/router';
import { Menu } from './menu/menu';
import { Riepilogo } from './riepilogo/riepilogo';

export const routes: Routes = [
  { path: 'menu', component: Menu },
  { path: 'riepilogo', component: Riepilogo },
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: '**', redirectTo: 'menu' },
];
