import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatIconModule, HasRoleDirective],
  template: `
    <div class="page">
      <h1><mat-icon>bar_chart</mat-icon> Informes</h1>
      <div *hasRole="'admin'" class="admin-notice">
        <mat-icon>admin_panel_settings</mat-icon>
        <span>Vista exclusiva de administrador</span>
      </div>
      <div class="coming-soon">
        <mat-icon>construction</mat-icon>
        <h2>Próximamente</h2>
        <p>Los informes detallados por profesional, período y tipo de consulta estarán disponibles en la próxima versión.</p>
        <ul>
          <li>Informe mensual de actividad por profesional</li>
          <li>Tasa de cancelación por período</li>
          <li>Ocupación por franja horaria</li>
          <li>Exportación a PDF / Excel</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 800px; }
    h1 { display: flex; align-items: center; gap: 10px; font-size: 26px; font-weight: 700; color: var(--cf-dark); margin: 0 0 20px; }
    .admin-notice { display: flex; align-items: center; gap: 8px; background: #e3f2fd; color: var(--cf-primary); border-radius: 8px; padding: 10px 16px; margin-bottom: 24px; font-weight: 500; font-size: 13px; }
    .coming-soon { background: #fff; border: 1px solid var(--cf-lighter); border-radius: 12px; padding: 32px; text-align: center; }
    .coming-soon mat-icon { font-size: 48px; height: 48px; width: 48px; color: var(--cf-pale); }
    .coming-soon h2 { margin: 12px 0 8px; color: var(--cf-dark); }
    .coming-soon p { color: var(--cf-mid-dark); margin-bottom: 16px; }
    .coming-soon ul { text-align: left; display: inline-block; color: var(--cf-mid-dark); line-height: 2; }
  `],
})
export class ReportsComponent {}
