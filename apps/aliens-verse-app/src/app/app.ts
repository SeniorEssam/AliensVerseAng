import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'av-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {}
