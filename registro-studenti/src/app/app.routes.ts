import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Elenco } from './elenco/elenco';
import { Inserimento } from './inserimento/inserimento';
import { DettaglioStudente } from './dettaglio-studente/dettaglio-studente';
import { ModificaStudente } from './modifica-studente/modifica-studente';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'elenco', component: Elenco },
  { path: 'inserimento', component: Inserimento },
  { path: 'elenco/:id', component: DettaglioStudente },
  { path: 'modifica/:id', component: ModificaStudente },
  { path: '**', redirectTo: 'home' },
];
