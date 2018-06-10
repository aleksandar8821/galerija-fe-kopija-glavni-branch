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
  public loggedUserProfileImage: string
  public createdUserName: string

  constructor(
        private http: HttpClient,
        private router: Router,
        private urlGuard: UrlGuard
    ) {
    this.isAuthenticated = Boolean(window.localStorage.getItem('loginToken'));
    this.loggedUserNameFirstLetter = window.localStorage.getItem('loggedUserNameFirstLetter')
    this.loggedUserProfileImage = window.localStorage.getItem('loggedUserProfileImage')
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
        this.loggedUser = new User(data.logedUser.id, data.logedUser.first_name, data.logedUser.last_name, data.logedUser.email, data.logedUser.profile_image)
        this.loggedUserNameFirstLetter = data.logedUser.first_name.charAt(0).toUpperCase()
        window.localStorage.setItem('loggedUserNameFirstLetter', this.loggedUserNameFirstLetter)
        this.loggedUserProfileImage = data.logedUser.profile_image
        window.localStorage.setItem('loggedUserProfileImage', this.loggedUserProfileImage)
        //email postavljam da bi mogao da poredim sa mailom usera koji je postavio komentar, pa da mu omogucim brisanje. Email je unikatan u bazi, stoga je dobar za identifikaciju (mada ovo mozda bas i nije dobro jer neko moze sanzati mail nekog korisnika ako ti ceprka po javascriptu, tako da je mozda bolje da ga poredis sa id-em iz baze, ali opet kolko je to safe, da imas id od korisnika prisutan u javascript kodu?):
        window.localStorage.setItem('loggedUserEmail', this.loggedUser.email)
        // ovaj data.token se kolko sam skontao zapravo nigde ne koristi u funkciji koja se subscribeovala na ovaj observable, ali da bi se sucess handler u toj funkciji okinuo, ovaj mora nesto da mu posalje u sa o.next, inace se nista ne desava... malo glupavo, al sta ces
  			o.next(data.token);
  			return o.complete();
  		}, (err) => {
  			return o.error(err);
  		});
  	});
  }

  public logout(event) {
      event.preventDefault()
      window.localStorage.removeItem('loginToken');
      window.localStorage.removeItem('loggedUserNameFirstLetter');
      window.localStorage.removeItem('loggedUserProfileImage');
      window.localStorage.removeItem('loggedUserEmail');
      this.isAuthenticated = false;
      this.loggedUserNameFirstLetter = '';
      this.loggedUserProfileImage = '';
      this.router.navigateByUrl('/galleries');
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

  // Registracija sa mail confirmation i profile slikom
  public registerWithProfileImage(userData: FormData) {
    return new Observable((o: Observer<any>) => {
      this.http.post('http://localhost:8000/api/register_with_profile_image', userData).subscribe((data: { createdUserName: string }) => {
        this.urlGuard.allow = true;
        this.createdUserName = data.createdUserName 
        this.router.navigateByUrl('register/verification-message');
      }, (err) => {
        return o.error(err);
      });
    });
  }

  // public forgotPasswordRequest(email: string){
  //   return new Observable((o: Observer<any>) => {
  //     this.http.post('http://localhost:8000/api/forgot_password', {
  //       'email': email
  //     }).subscribe(() => {
  //       alert('We have sent you an email with a link so you can reset your password!')
  //     }, (err) => {
  //       return o.error(err);
  //     });
  //   });
  // }

  public resetPassword(user: User, token: string){
    return new Observable((o: Observer<any>) => {
      this.http.post('http://localhost:8000/api/password-reset', {
        'email': user.email,
        'password': user.password,
        'password_confirmation': user.confirmPassword,
        'token': token
      }).subscribe((data: { loginToken: string, logedUser: any}) => {
        window.localStorage.setItem('loginToken', data.loginToken);
        this.isAuthenticated = true;
        this.loggedUser = new User(data.logedUser.id, data.logedUser.first_name, data.logedUser.last_name, data.logedUser.email, data.logedUser.profile_image)
        this.loggedUserNameFirstLetter = data.logedUser.first_name.charAt(0).toUpperCase()
        window.localStorage.setItem('loggedUserNameFirstLetter', this.loggedUserNameFirstLetter)
        this.loggedUserProfileImage = data.logedUser.profile_image
        window.localStorage.setItem('loggedUserProfileImage', this.loggedUserProfileImage)
        //email postavljam da bi mogao da poredim sa mailom usera koji je postavio komentar, pa da mu omogucim brisanje. Email je unikatan u bazi, stoga je dobar za identifikaciju (mada ovo mozda bas i nije dobro jer neko moze sanzati mail nekog korisnika ako ti ceprka po javascriptu, tako da je mozda bolje da ga poredis sa id-em iz baze, ali opet kolko je to safe, da imas id od korisnika prisutan u javascript kodu?):
        window.localStorage.setItem('loggedUserEmail', this.loggedUser.email)
        // ovaj data.loginToken se kolko sam skontao zapravo nigde ne koristi u funkciji koja se subscribeovala na ovaj observable, ali da bi se sucess handler u toj funkciji okinuo, ovaj mora nesto da mu posalje u sa o.next, inace se nista ne desava... malo glupavo, al sta ces
        o.next(data.loginToken);
        return o.complete();
      }, (err) => {
        return o.error(err);
      });
    });
  }

  public getUserInfo(){
    return new Observable((o: Observer<any>) => {
      this.http.get('http://localhost:8000/api/get_user_info', {headers: this.getRequestHeaders()}).subscribe((loggedUser) => {
        o.next(loggedUser)
        return o.complete()
      }, (err) => {
        return o.error(err)
      })
    })
  }

}
