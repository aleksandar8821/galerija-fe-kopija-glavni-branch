import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';


@Component({
  selector: 'app-safe-forgot-password',
  templateUrl: './safe-forgot-password.component.html',
  styleUrls: ['./safe-forgot-password.component.css']
})
export class SafeForgotPasswordComponent implements OnInit {

  	public email: string
  	public allowAccessToken: string
  	@ViewChild("progressBar") progressBar: ElementRef


    constructor(private authService: AuthService, private http: HttpClient, private renderer: Renderer2, private router: Router, private route: ActivatedRoute, private location: Location) { }

    ngOnInit() {

    	this.allowAccessToken = this.route.snapshot.params.token

    }

    public safeForgotPasswordRequest(email: string, allowAccessToken: string){
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
    	  'email': email,
    	  'allow_access_token': allowAccessToken
    	}).subscribe(() => {
    		this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
    	  alert('We have sent you an email with a link so you can reset your password!')
    	  // this.router.navigateByUrl('/');
        this.location.back();//nasao ovde https://stackoverflow.com/questions/35446955/how-to-go-back-last-page/41953992
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
