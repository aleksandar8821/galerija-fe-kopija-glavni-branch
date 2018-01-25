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
  		this.router.navigateByUrl('/login'); //ovo ti i ne biva okinuto (doduse i ne treba) jer funkcija na koju si se subscribeovao ne vraca nista preko o.next
  	}, (err: HttpErrorResponse) => {
      //sa for in iteracijom, nisam uspeo da dobavim ove greske, ova funkcija Object.values() je pravo cudo!
      let errors = Object.values(err.error.errors) 
      let errorString: string = ''
      errors.forEach(function(message){
        errorString += message + '\n'
      });
  		alert(errorString);
  	});
  }


}
