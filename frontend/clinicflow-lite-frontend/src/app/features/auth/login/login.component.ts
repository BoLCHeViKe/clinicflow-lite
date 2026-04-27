import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatInputModule, MatCardModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Iniciar sesión</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="tu@email.com">
              @if (form.get('email')?.hasError('required')) {
                <mat-error>El email es obligatorio</mat-error>
              }
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Email no válido</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password">
              @if (form.get('password')?.hasError('required')) {
                <mat-error>La contraseña es obligatoria</mat-error>
              }
            </mat-form-field>
            @if (error()) {
              <p class="error-msg">{{ error() }}</p>
            }
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()" class="full-width">
              {{ loading() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a routerLink="/auth/register">¿No tienes cuenta? Regístrate</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 16px; }
    .auth-card { width: 100%; max-width: 400px; padding: 16px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .error-msg { color: #f44336; font-size: 14px; margin-bottom: 12px; }
    mat-card-actions { padding: 16px; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.value as { email: string; password: string }).subscribe({
      next: () => this.router.navigate(['/appointments']),
      error: (err) => {
        this.error.set(err.error?.error || 'Error al iniciar sesión');
        this.loading.set(false);
      },
    });
  }
}
