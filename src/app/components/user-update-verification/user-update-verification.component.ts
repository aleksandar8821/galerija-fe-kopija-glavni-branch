import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-update-verification',
  templateUrl: './user-update-verification.component.html',
  styleUrls: ['./user-update-verification.component.css']
})
export class UserUpdateVerificationComponent implements OnInit {

	public routePath: string
	public user_id: string
	public userUpdateId: string
  public token: string
	public emailQueryParam: string

	@ViewChild("serverMessage") serverMessage: ElementRef
  @ViewChild("progressBar") progressBar: ElementRef


  constructor(private route: ActivatedRoute, private authService: AuthService, private http: HttpClient, private renderer: Renderer2) { }

  ngOnInit() {
  	//ovo je isti onaj path koji navodis u routing modulu (tamo gde navodis rute za router outlet) i na osnovu toga koja je ruta aktivirana radim razlicite stvari (dakle ovo radim, zato sto mi dve rute gadjaju istu komponentu, pa na osnovu toga koja ruta je aktivira, radim razlicite stvari). Ne spominje se puno ovaj routeConfig.path puno na netu ali po onom sto se spominje to bi trebalo da je to i radi mi skroz kako treba. Zvanicna dok. https://angular.io/api/router/ActivatedRoute#routeConfig
    this.routePath = this.route.snapshot.routeConfig.path
    this.user_id = this.route.snapshot.params.id
    this.userUpdateId = this.route.snapshot.params.userUpdateId
    this.token = this.route.snapshot.params.token
    this.emailQueryParam = this.route.snapshot.queryParams.email

    // console.log(this.route.snapshot.queryParams);

    if(this.routePath === 'my-account/verification/:id/:token'){
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')

    	this.authService.verifyUserUpdate(this.user_id, this.token).subscribe((user: any) => {
        this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')

    		// Na ovaj nacin stavljas text unutar nekog DOM elementa (https://alligator.io/angular/using-renderer2/#createelement--appendchild--createtext)
    		const message = this.renderer.createText('You have successfully updated your account data!');
    		this.renderer.appendChild(this.serverMessage.nativeElement, message);
    	}, (err: HttpErrorResponse) => {
        this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')

    		const message = this.renderer.createText(err.error.error)
    		this.renderer.appendChild(this.serverMessage.nativeElement, message);
    	})
    }

    if(this.routePath === 'my-account/block_revoke_changes/:id/:userUpdateId/:token'){
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')

    	this.authService.blockRevokeChanges(this.user_id, this.userUpdateId, this.token).subscribe((user: any) => {
        this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')

    		// Na ovaj nacin stavljas text unutar nekog DOM elementa (https://alligator.io/angular/using-renderer2/#createelement--appendchild--createtext)
    		const message = this.renderer.createText('You have successfully revoked your account changes, you are logged out everywhere where you were logged in till now and your account is blocked for next 48 hours! We have sent you an email with a safe link, from which you can access your account. If you have any doubts that your account has been compromised, we HIGHLY recommend that you change your password in mentioned 48 hours for security reasons!');
    		this.renderer.appendChild(this.serverMessage.nativeElement, message);
    	}, (err: HttpErrorResponse) => {
        this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')

    		const message = this.renderer.createText(err.error.error)
    		this.renderer.appendChild(this.serverMessage.nativeElement, message);
    	})
    }


    if(this.routePath === 'my-account/block_request_and_account_logout_user/:id/:token'){
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')

      this.authService.blockRequestAndAccountLogoutUser(this.user_id, this.token).subscribe((user: any) => {
        this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')

        // Na ovaj nacin stavljas text unutar nekog DOM elementa (https://alligator.io/angular/using-renderer2/#createelement--appendchild--createtext)
        const message = this.renderer.createText('You have successfully permanently blocked the request for account data changes, you are logged out everywhere where you were logged in till now and your account is blocked for next 48 hours! We have sent you an email with a safe link, from which you can access your account. If you have any doubts that your account has been compromised, we HIGHLY recommend that you change your password in mentioned 48 hours for security reasons!');
        this.renderer.appendChild(this.serverMessage.nativeElement, message);
      }, (err: HttpErrorResponse) => {
        this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')

        const message = this.renderer.createText(err.error.error)
        this.renderer.appendChild(this.serverMessage.nativeElement, message);
      })
    }


  }

}
