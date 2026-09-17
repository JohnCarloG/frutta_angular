import { Routes } from '@angular/router';
import { AnimalsComponent } from './animals-component/animals-component';
import { FruitsComponent } from './fruits-component/fruits-component';

export const routes: Routes = [
    { path: 'animals', component: AnimalsComponent},
    { path: 'fruits', component: FruitsComponent}
];
