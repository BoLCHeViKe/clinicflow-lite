import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

/**
 * Structural directive that renders its host element only when the logged-in
 * user's role matches one of the provided roles.
 *
 * Usage:
 *   <button *hasRole="'admin'">Admin only</button>
 *   <div *hasRole="['admin', 'receptionist']">Manage section</div>
 */
@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  @Input('hasRole') roles: UserRole | UserRole[] = [];

  private templateRef = inject(TemplateRef<unknown>);
  private vcRef = inject(ViewContainerRef);
  private auth = inject(AuthService);

  ngOnInit(): void {
    const userRole = this.auth.currentUser()?.role;
    const allowed: UserRole[] = Array.isArray(this.roles) ? this.roles : [this.roles];
    if (userRole && allowed.includes(userRole)) {
      this.vcRef.createEmbeddedView(this.templateRef);
    }
  }
}
