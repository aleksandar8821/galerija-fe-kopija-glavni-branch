import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

	public email: string
	@ViewChild("progressBar") progressBar: ElementRef


  constructor(private authService: AuthService, private http: HttpClient, private renderer: Renderer2, private router: Router) { }

  ngOnInit() {
  }

  public forgotPasswordRequest(email: string){
  	this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')

  	// this.authService.forgotPasswordRequest(email).subscribe(() => {

  	// }, (err: HttpErrorResponse) => {
  	// 	console.log(err);
			// //sa for in iteracijom, nisam uspeo da dobavim ove greske, ova funkcija Object.values() je pravo cudo!
   //    let errors = Object.values(err.error.errors) 
   //    let errorString: string = ''
   //    errors.forEach(function(message){
   //      errorString += message + '\n'
   //    });
  	// 	alert(errorString);
  	// })

  	// Msm da nema potrebe da komplikujem kao u gornjem zakomentarisanom kodu, tako da ne zovem metodu u servisu nego radim samo ovo:
  	this.http.post('http://localhost:8000/api/forgot_password', {
  	  'email': email
  	}).subscribe(() => {
  		this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
  	  alert('We have sent you an email with a link so you can reset your password!')
  	  this.router.navigateByUrl('/');
  	}, (err: HttpErrorResponse) => {
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
      console.log(err);
      //sa for in iteracijom, nisam uspeo da dobavim ove greske, ova funkcija Object.values() je pravo cudo!
      if(err.error.errors){
        let errors = Object.values(err.error.errors) 
        let errorString: string = ''
        errors.forEach(function(message){
          errorString += message + '\n'
        });
    		alert(errorString);
        
      }else{
        alert(err.error.error)
      }
  	});

  }

}
