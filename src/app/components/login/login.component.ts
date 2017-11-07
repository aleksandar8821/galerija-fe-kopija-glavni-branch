import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	email: string;
	password: string;

  constructor(private authService: AuthService, private router: Router) { }

  login(email, password) {
  	console.log(email);
  	this.authService.login(email, password).subscribe(() => {
  		console.log('success!');
  		// this.router.navigateByUrl('/');
  	}, (err: HttpErrorResponse) => {
  		alert(`${err.error.error}`);
  	});
  }

  logout(){
  	
  }

  ngOnInit() {
  }

}
