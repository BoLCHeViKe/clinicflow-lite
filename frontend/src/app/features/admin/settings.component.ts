import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, HasRoleDirective],
  template: `
    <div class="page">
      <h1><mat-icon>settings</mat-icon> Ajustes</h1>
      <div *hasRole="'admin'" class="admin-notice">
        <mat-icon>admin_panel_settings</mat-icon>
        <span>Vista exclusiva de administrador</span>
      </div>
      <div class="settings-grid">
        <div class="settings-card">
          <mat-icon>group</mat-icon>
          <h3>Gestión de usuarios</h3>
          <p>Crear y gestionar cuentas de recepcionistas y profesionales.</p>
          <span class="badge coming">Próximamente</span>
        </div>
        <div class="settings-card">
          <mat-icon>schedule</mat-icon>
          <h3>Horarios de clínica</h3>
          <p>Configurar horario de apertura, días festivos y franjas disponibles.</p>
          <span class="badge coming">Próximamente</span>
        </div>
        <div class="settings-card">
          <mat-icon>notifications</mat-icon>
          <h3>Notificaciones</h3>
          <p>Recordatorios automáticos por email/SMS a pacientes.</p>
          <span class="badge coming">Próximamente</span>
        </div>
        <div class="settings-card">
          <mat-icon>security</mat-icon>
          <h3>Seguridad y auditoría</h3>
          <p>Registro de accesos y actividad en el sistema.</p>
          <span class="badge coming">Próximamente</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 900px; }
    h1 { display: flex; align-items: center; gap: 10px; font-size: 26px; font-weight: 700; color: var(--cf-dark); margin: 0 0 20px; }
    .admin-notice { display: flex; align-items: center; gap: 8px; background: #e3f2fd; color: var(--cf-primary); border-radius: 8px; padding: 10px 16px; margin-bottom: 24px; font-weight: 500; font-size: 13px; }
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .settings-card { background: #fff; border: 1px solid var(--cf-lighter); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 8px; }
    .settings-card mat-icon { font-size: 28px; height: 28px; width: 28px; color: var(--cf-primary); }
    .settings-card h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--cf-dark); }
    .settings-card p { margin: 0; font-size: 13px; color: var(--cf-mid-dark); flex: 1; }
    .badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 8px; align-self: flex-start; text-transform: uppercase; letter-spacing: .5px; }
    .badge.coming { background: #fff8e1; color: #f57f17; }
  `],
})
export class SettingsComponent {}
