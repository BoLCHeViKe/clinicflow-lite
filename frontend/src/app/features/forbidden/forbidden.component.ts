import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="forbidden">
      <mat-icon>lock</mat-icon>
      <h1>Acceso denegado</h1>
      <p>No tienes permiso para acceder a esta sección.</p>
      <button mat-raised-button color="primary" (click)="goBack()">Volver al inicio</button>
    </div>
  `,
  styles: [`
    .forbidden {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100vh; gap: 16px; color: var(--cf-mid-dark);
    }
    mat-icon { font-size: 64px; height: 64px; width: 64px; color: #ef9a9a; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; color: var(--cf-dark); }
    p { margin: 0; font-size: 15px; }
  `],
})
export class ForbiddenComponent {
  private router = inject(Router);
  goBack(): void { this.router.navigate(['/dashboard']); }
}
