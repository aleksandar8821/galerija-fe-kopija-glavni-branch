import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs/Rx';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user';

@Injectable()
export class AuthService {

	public isAuthenticated: boolean;

  constructor(
        private http: HttpClient,
        private router: Router,
    ) {
    this.isAuthenticated = Boolean(window.localStorage.getItem('loginToken'));
  }

  public login(email: string, password: string) {
  	return new Observable((o: Observer<any>) => {
  		this.http.post('http://localhost:8000/api/login', {
  			'email': email,
  			'password': password
  		}).subscribe((data: { token: string }) => {
  			window.localStorage.setItem('loginToken', data.token);
  			this.isAuthenticated = true;

  			o.next(data.token);
  			return o.complete();
  		}, (err) => {
  			return o.error(err);
  		});
  	});
  }

  public logout() {
      window.localStorage.removeItem('loginToken');
      this.isAuthenticated = false;
      this.router.navigateByUrl('/login');
  }
  
  public register(user: User) {
    console.log('nnnnnnn');
    return new Observable((o: Observer<any>) => {
      this.http.post('http://localhost:8000/api/register', {
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'password': user.password,
        'password_confirmation': user.confirmPassword,
        'accepted_terms': user.acceptedTerms
      }).subscribe((data: { token: string }) => {
        window.localStorage.setItem('loginToken', data.token);
        this.isAuthenticated = true;
        this.router.navigateByUrl('/');
      }, (err) => {
        return o.error(err);
      });
    });
  }


}
