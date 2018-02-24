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
  public submitBtn: any
  public progressBar: any

	constructor(
		private router: Router,
		private authService: AuthService
	) {}


  ngOnInit() {
    this.submitBtn = document.getElementById('myid-register-submit-button')
    this.progressBar = document.querySelector('.progress')

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
      // Vracam disabled na false, ukoliko registracija nije uspela, prethodno sam ga podesio na true dole, ispod ove funkcije, isto tako iskljucujem progress bar
      this.submitBtn.disabled = false
      this.progressBar.style.visibility = 'hidden'
  	}, () => {
      // Ovde radim isto sto i u error handleru, s tim sto ga za svaki slucaj odlazem, jer je mozda moguce da mi pre redirekcije koja se desava ako zahtev uspe odradi ova podesavanja, a to nije pozeljno da se desi
      setTimeout( () => {
        this.submitBtn.disabled = false
        this.progressBar.style.visibility = 'hidden'
        
      }, 2000)
      
    });

    // Cim pokrene ovu gore funkciju authService.register(), dugme se disableuje zato da user ne bi kliktao ponovo na dugme misleci da mu podaci nisu odmah poslati i ukljucujem progress bar da user zna da aplikacija nesto radi da nije zapucala
    this.submitBtn.disabled = true;
    this.progressBar.style.visibility = 'visible'
  }


}
