import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../shared/models/user';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

	public user: User = new User();

	constructor(
		private router: Router,
		private authService: AuthService
	) {}


  ngOnInit() {
  }

  public register() {
  	this.authService.register(this.user).subscribe(() => {
  		this.router.navigateByUrl('/login');
  	}, (err: HttpErrorResponse) => {
  		alert(`${err.error.error}`);
  	});
  }


}
