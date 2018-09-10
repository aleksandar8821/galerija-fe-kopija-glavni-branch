import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-safe-login',
  templateUrl: './safe-login.component.html',
  styleUrls: ['./safe-login.component.css']
})
export class SafeLoginComponent implements OnInit {

  	email: string;
  	password: string;
  	allowAccessToken: string
    public submitBtn: any
    public progressBar: any

    constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

    safeLogin(email, password, allowAccessToken) {
    	this.authService.safeLogin(email, password, allowAccessToken).subscribe(() => {
    		this.router.navigateByUrl('/');
    	}, (err: HttpErrorResponse) => {
    		alert(`${err.error.error}`);
        // Vracam disabled na false, ukoliko login nije uspeo, prethodno sam ga podesio na true dole, ispod ove funkcije, isto tako iskljucujem progress bar
        this.submitBtn.disabled = false
        this.progressBar.style.visibility = 'hidden'
    	}, () => {
        // Ovde radim isto sto i u error handleru, s tim sto ga za svaki slucaj odlazem, jer je mozda moguce da mi pre redirekcije koja se desava ako zahtev uspe odradi ova podesavanja, a to nije pozeljno da se desi
          setTimeout( () => {
            this.submitBtn.disabled = false
            this.progressBar.style.visibility = 'hidden'
            
          }, 2000)
        }
      );

      // Cim pokrene ovu gore funkciju authService.login(), dugme se disableuje zato da user ne bi kliktao ponovo na dugme misleci da mu podaci nisu odmah poslati i ukljucujem progress bar da user zna da aplikacija nesto radi da nije zapucala
      this.submitBtn.disabled = true;
      this.progressBar.style.visibility = 'visible'
    }

    ngOnInit() {
    	this.allowAccessToken = this.route.snapshot.params.token
      this.submitBtn = document.getElementById('myid-register-submit-button')
      this.progressBar = document.querySelector('.progress')

    }

}
