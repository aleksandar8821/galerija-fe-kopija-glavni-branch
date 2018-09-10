import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-safe-password-reset',
  templateUrl: './safe-password-reset.component.html',
  styleUrls: ['./safe-password-reset.component.css']
})
export class SafePasswordResetComponent implements OnInit {

  public user: User = new User();
	public passwordResetToken: string
	public allowAccessToken: string
  @ViewChild("progressBar") progressBar: ElementRef
  @ViewChild("btnResetPassword") btnResetPassword: ElementRef

  constructor(private route: ActivatedRoute, private authService: AuthService, private http: HttpClient, private router: Router, private renderer: Renderer2) { }

  ngOnInit() {
  	// msm da je ovde dovoljno da odradim snapshot rute, jer po meni ovde ne bi trebalo da dodje do ovog problema https://scotch.io/tutorials/handling-route-parameters-in-angular-v2#toc-angular-route-performance
  	this.user.email = this.route.snapshot.params.email
  	this.passwordResetToken = this.route.snapshot.params.passwordResetToken
  	this.allowAccessToken = this.route.snapshot.params.allowAccessToken
  }

  public checkEmailAndToken(){
  	// this.http.get('http://localhost:8000/api/')
  }

  public resetPassword(){
    this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')
    this.renderer.setProperty(this.btnResetPassword.nativeElement, 'disabled', true)

    this.authService.safeResetPassword(this.user, this.passwordResetToken, this.allowAccessToken).subscribe(() => {
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
      this.renderer.setProperty(this.btnResetPassword.nativeElement, 'disabled', false)

      alert('You have successfully reseted your password and you are now logged in!')
      this.router.navigateByUrl('/');
    }, (err: HttpErrorResponse) => {
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
      this.renderer.setProperty(this.btnResetPassword.nativeElement, 'disabled', false)
      
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
    })
  }

}
