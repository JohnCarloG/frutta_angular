import { Routes } from '@angular/router';
import { AnimalsComponent } from './animals-component/animals-component';
import { FruitsComponent } from './fruits-component/fruits-component';
import { GenericComponent } from './generic/generic';

export const routes: Routes = [
    { path: 'animals', component: AnimalsComponent},
    { path: 'fruits', component: FruitsComponent},
    {path: '', redirectTo: '/animals', pathMatch: 'full'},
    { path: 'generic/:id', component: GenericComponent },
];
