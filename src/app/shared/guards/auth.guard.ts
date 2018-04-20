import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  public isAuthenticated = Boolean(window.localStorage.getItem('loginToken'));

	constructor(
    private router: Router,
    private authService: AuthService) {
  }


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
  	// if (!this.authService.isAuthenticated) {
  	// 	this.router.navigate(['/login']);
  	// }

    // radi isto ko i ovaj gore zakomentarisani, inace ovaj gore zakomentarisani je uradjen kao i ovi iz vivify sto su radili https://gitlab.com/vivify-ideas/vivifyacademy-advanced-rest-api-movies-fe/blob/master/src/app/shared/guards/auth.guard.ts
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
    }

    return true;
  }
}
