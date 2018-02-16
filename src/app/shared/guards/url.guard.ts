import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UrlGuard implements CanActivate {

	constructor(private router: Router){}

	//must be set to true for navigation to succeed
        allow = false;
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
       
		    if(this.allow){
	        this.allow = false;
	        return true;
		    }
		    else{
		    	this.router.navigate(['/']);
		    };
        
  }
}
