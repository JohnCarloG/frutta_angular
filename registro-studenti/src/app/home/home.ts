import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentiService } from '../services/studenti-service';
import { StudenteCard } from '../studente-card/studente-card';
@Component({
  selector: 'app-home',
  imports: [RouterLink, StudenteCard],
  templateUrl: './home.html',
})
export class Home {
  readonly studentiService = inject(StudentiService);
}
