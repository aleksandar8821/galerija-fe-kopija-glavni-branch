import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs/Rx';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { UrlGuard } from '../guards/url.guard';

@Injectable()
export class AuthService {

	public isAuthenticated: boolean;
  private loggedUser: User
  public loggedUserNameFirstLetter: string
  public createdUserName: string

  constructor(
        private http: HttpClient,
        private router: Router,
        private urlGuard: UrlGuard
    ) {
    this.isAuthenticated = Boolean(window.localStorage.getItem('loginToken'));
    this.loggedUserNameFirstLetter = window.localStorage.getItem('loggedUserNameFirstLetter')
  }

  public getRequestHeaders(){
    return new HttpHeaders().set('Authorization', 'Bearer ' + window.localStorage.getItem('loginToken'))
  }

  public login(email: string, password: string) {
  	return new Observable((o: Observer<any>) => {
  		this.http.post('http://localhost:8000/api/login', {
  			'email': email,
  			'password': password
  		}).subscribe((data: { token: string, logedUser: any}) => {
  			window.localStorage.setItem('loginToken', data.token);
  			this.isAuthenticated = true;
        this.loggedUser = new User(data.logedUser.id, data.logedUser.first_name, data.logedUser.last_name, data.logedUser.email)
        this.loggedUserNameFirstLetter = data.logedUser.first_name.charAt(0).toUpperCase()
        window.localStorage.setItem('loggedUserNameFirstLetter', this.loggedUserNameFirstLetter)
        // ovaj data.token se kolko sam skontao zapravo nigde ne koristi u funkciji koja se subscribeovala na ovaj observable, ali da bi se sucess handler u toj funkciji okinuo, ovaj mora nesto da mu posalje u sa o.next, inace se nista ne desava... malo glupavo, al sta ces
  			o.next(data.token);
  			return o.complete();
  		}, (err) => {
  			return o.error(err);
  		});
  	});
  }

  public logout() {
      window.localStorage.removeItem('loginToken');
      window.localStorage.removeItem('loggedUserNameFirstLetter');
      this.isAuthenticated = false;
      this.loggedUserNameFirstLetter = '';
      this.router.navigateByUrl('/login');
  }
  
  // Stara registracija, bez mail confirmation-a

  // public register(user: User) {
  //   console.log('nnnnnnn');
  //   return new Observable((o: Observer<any>) => {
  //     this.http.post('http://localhost:8000/api/register', {
  //       'first_name': user.firstName,
  //       'last_name': user.lastName,
  //       'email': user.email,
  //       'password': user.password,
  //       'password_confirmation': user.confirmPassword,
  //       'accepted_terms': user.acceptedTerms
  //     }).subscribe((data: { token: string, logedUser: any }) => {
  //       window.localStorage.setItem('loginToken', data.token);
  //       alert('You are now successfully registered')
  //       this.isAuthenticated = true;
  //       this.loggedUser = new User(data.logedUser.id, data.logedUser.first_name, data.logedUser.last_name, data.logedUser.email)
  //       this.loggedUserNameFirstLetter = data.logedUser.first_name.charAt(0).toUpperCase()
  //       window.localStorage.setItem('loggedUserNameFirstLetter', this.loggedUserNameFirstLetter)
  //       this.router.navigateByUrl('/');
  //     }, (err) => {
  //       return o.error(err);
  //     });
  //   });
  // }


  // Nova registracija, sa mail confirmation
  
  public register(user: User) {
    console.log('nnnnnnn');
    return new Observable((o: Observer<any>) => {
      this.http.post('http://localhost:8000/api/register', {
        'first_name': user.firstName,
        'last_name': user.lastName,
        'email': user.email,
        'password': user.password,
        'password_confirmation': user.confirmPassword,
        'accepted_terms': user.acceptedTerms
      }).subscribe((data: { createdUserName: string }) => {
        this.urlGuard.allow = true;
        this.createdUserName = data.createdUserName 
        this.router.navigateByUrl('register/verification-message');
      }, (err) => {
        return o.error(err);
      });
    });
  }



}
