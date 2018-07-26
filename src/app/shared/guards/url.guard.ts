import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UrlGuard implements CanActivate {

	constructor(private router: Router){}

	// Foru za ovaj guard nasao ovde https://stackoverflow.com/questions/40145779/angular-2-block-get-request-on-a-url. Dakle, moguce je doci na stranicu koju stiti ovaj guard jedino iz koda, tj preko redirekcije u kodu (vidi u auth servisu, samo potrazi urlGuard), ne moze se doci preko address bara u browseru.

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
