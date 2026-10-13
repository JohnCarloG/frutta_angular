import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentiService } from '../services/studenti-service';
@Component({ selector: 'app-home', imports: [RouterLink], templateUrl: './home.html' })
export class Home { readonly studentiService = inject(StudentiService); }
