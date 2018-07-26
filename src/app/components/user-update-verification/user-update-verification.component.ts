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

	@ViewChild("serverMessage") serverMessage: ElementRef

  constructor(private route: ActivatedRoute, private authService: AuthService, private http: HttpClient, private renderer: Renderer2) { }

  ngOnInit() {
  	//ovo je isti onaj path koji navodis u routing modulu (tamo gde navodis rute za router outlet) i na osnovu toga koja je ruta aktivirana radim razlicite stvari (dakle ovo radim, zato sto mi dve rute gadjaju istu komponentu, pa na osnovu toga koja ruta je aktivira, radim razlicite stvari). Ne spominje se puno ovaj routeConfig.path puno na netu ali po onom sto se spominje to bi trebalo da je to i radi mi skroz kako treba. Zvanicna dok. https://angular.io/api/router/ActivatedRoute#routeConfig
    this.routePath = this.route.snapshot.routeConfig.path
    this.user_id = this.route.snapshot.params.id
    this.userUpdateId = this.route.snapshot.params.userUpdateId
    this.token = this.route.snapshot.params.token

    if(this.routePath === 'my-account/verification/:id/:token'){
    	this.authService.verifyUserUpdate(this.user_id, this.token).subscribe((user: any) => {
    		// Na ovaj nacin stavljas text unutar nekog DOM elementa (https://alligator.io/angular/using-renderer2/#createelement--appendchild--createtext)
    		const message = this.renderer.createText('You have successfully updated your account data!');
    		this.renderer.appendChild(this.serverMessage.nativeElement, message);
    	}, (err: HttpErrorResponse) => {
    		const message = this.renderer.createText(err.error.error)
    		this.renderer.appendChild(this.serverMessage.nativeElement, message);
    	})
    }

    if(this.routePath === 'my-account/block_revoke_changes/:id/:userUpdateId/:token'){
    	this.authService.blockRevokeChanges(this.user_id, this.userUpdateId, this.token).subscribe((user: any) => {
    		// Na ovaj nacin stavljas text unutar nekog DOM elementa (https://alligator.io/angular/using-renderer2/#createelement--appendchild--createtext)
    		const message = this.renderer.createText('You have successfully revoked your account changes!');
    		this.renderer.appendChild(this.serverMessage.nativeElement, message);
    	}, (err: HttpErrorResponse) => {
    		const message = this.renderer.createText(err.error.error)
    		this.renderer.appendChild(this.serverMessage.nativeElement, message);
    	})
    }

  }

}
