import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

	public user: User = new User();
	public unchangedUserData: User
	public userDataReceived: boolean = false
  // public submitBtn: any
  // public progressBar: any

  @ViewChild("firstNameInput") firstNameInput: ElementRef
  @ViewChild("lastNameInput") lastNameInput: ElementRef
  @ViewChild("emailInput") emailInput: ElementRef
  @ViewChild("btnChangeFirstName") btnChangeFirstName: ElementRef
  @ViewChild("btnChangeLastName") btnChangeLastName: ElementRef
  @ViewChild("btnChangeEmail") btnChangeEmail: ElementRef
  @ViewChild("btnChangePassword") btnChangePassword: ElementRef
  @ViewChild("passwordChangeContainer") passwordChangeContainer: ElementRef
  @ViewChild("passwordInput") passwordInput: ElementRef
  @ViewChild("confirmPasswordInput") confirmPasswordInput: ElementRef

	public loggedUserExsistingProfileImage = window.localStorage.getItem('loggedUserProfileImage')
	public uploadImageError: string
	public removeUploadImageErrorTimeout: any

	/* **************** Image cropper ***************** */
	// PS. skinuto odavde https://www.npmjs.com/package/ngx-image-cropper
	imageChangedEvent: any = '';
	croppedImage: any = '';

	fileChangeEvent(event: any): void {
	    this.imageChangedEvent = event;
	    // console.log(this.imageChangedEvent.target.files[0]);
	    this.uploadImageError = null
	    // Ovo sam ja dodao, ako stavis cancel da ti se izbrisu obe slike koje se prikazuju
	    if(!this.imageChangedEvent.target.files[0]){
	      this.croppedImage = ''
	      this.imageChangedEvent = ''
	    }
	}
	imageCropped(image: string) {
	    this.croppedImage = image;
	    // console.log(this.croppedImage);
	}
	imageLoaded() {
	    // show cropper
	}
	loadImageFailed() {
	    // show message
	    this.imageChangedEvent.target.value = null
	    this.imageChangedEvent = ''
	    this.croppedImage = ''
	    clearTimeout(this.removeUploadImageErrorTimeout) // problem je kad vise puta zaredom trigerujes ovu gresku stari setTimeout koji je aktiviran ostaje aktivan i sklonice gresku pre vremena, zato radim clearTimeout
	    this.uploadImageError = "File must be an image!"
	    this.removeUploadImageErrorTimeout = setTimeout(() => {this.uploadImageError = null}, 8500) //ovo ubacujem zato sto u css animacijama ne mogu da koristim display property, pa kad podesim uploadImageError = null, angular hidden direktiva ce ga podesiti na display: none

	}

	clearImage(){
	  if(this.imageChangedEvent){
	    this.imageChangedEvent.target.value = null
	    this.imageChangedEvent = ''
	  }
	  this.croppedImage = ''
	}
	/* ************************************************ */

  constructor(private authService: AuthService, private renderer: Renderer2) { }

  ngOnInit() {
  	this.authService.getUserInfo().subscribe((loggedUser) => {
  		// console.log(loggedUser)
  		this.user = new User(loggedUser.id, loggedUser.first_name, loggedUser.last_name, loggedUser.email, loggedUser.profile_image)
  		// Moram praviti dva odvojena objekta, jer kod objekata vazi by reference pravilo, ne mogu napraviti jedan pa ih dodati ostalima onda bi imao samo jedan objekat na kojeg ostali referenciraju. Ovako imam dva odvojena objekta
  		this.unchangedUserData = new User(loggedUser.id, loggedUser.first_name, loggedUser.last_name, loggedUser.email, loggedUser.profile_image)
  		this.userDataReceived = true
  	})
  }

  public changeInputToggle(event){
  	switch (event.target.id) {
  		case "btnChangeFirstName":
  			if (this.firstNameInput.nativeElement.readOnly) {
  				this.renderer.removeAttribute(this.firstNameInput.nativeElement, 'readonly')
  				this.user.firstName = ''
  				this.firstNameInput.nativeElement.focus()
  				this.renderer.removeClass(this.btnChangeFirstName.nativeElement, 'btn-success')
  				this.renderer.addClass(this.btnChangeFirstName.nativeElement, 'btn-danger')
  				this.renderer.setValue(this.btnChangeFirstName.nativeElement.childNodes[0], 'Cancel')
  			}else{
  				// console.log(this.unchangedUserData);
  				this.renderer.setAttribute(this.firstNameInput.nativeElement, 'readonly', 'readonly')
  				this.user.firstName = this.unchangedUserData.firstName
  				this.renderer.removeClass(this.btnChangeFirstName.nativeElement, 'btn-danger')
  				this.renderer.addClass(this.btnChangeFirstName.nativeElement, 'btn-success')
  				this.renderer.setValue(this.btnChangeFirstName.nativeElement.childNodes[0], 'Change')
  			}
  			break;

  		case "btnChangeLastName":
  			if (this.lastNameInput.nativeElement.readOnly) {
  				this.renderer.removeAttribute(this.lastNameInput.nativeElement, 'readonly')
  				this.user.lastName = ''
  				this.lastNameInput.nativeElement.focus()
  				this.renderer.removeClass(this.btnChangeLastName.nativeElement, 'btn-success')
  				this.renderer.addClass(this.btnChangeLastName.nativeElement, 'btn-danger')
  				this.renderer.setValue(this.btnChangeLastName.nativeElement.childNodes[0], 'Cancel')
  			}else{
  				this.renderer.setAttribute(this.lastNameInput.nativeElement, 'readonly', 'readonly')
  				this.user.lastName = this.unchangedUserData.lastName
  				this.renderer.removeClass(this.btnChangeLastName.nativeElement, 'btn-danger')
  				this.renderer.addClass(this.btnChangeLastName.nativeElement, 'btn-success')
  				this.renderer.setValue(this.btnChangeLastName.nativeElement.childNodes[0], 'Change')
  			}
  			break;

  		case "btnChangeEmail":
  			if (this.emailInput.nativeElement.readOnly) {
  				this.renderer.removeAttribute(this.emailInput.nativeElement, 'readonly')
  				this.user.email = ''
  				this.emailInput.nativeElement.focus()
  				this.renderer.removeClass(this.btnChangeEmail.nativeElement, 'btn-success')
  				this.renderer.addClass(this.btnChangeEmail.nativeElement, 'btn-danger')
  				this.renderer.setValue(this.btnChangeEmail.nativeElement.childNodes[0], 'Cancel')
  			}else{
  				this.renderer.setAttribute(this.emailInput.nativeElement, 'readonly', 'readonly')
  				this.user.email = this.unchangedUserData.email
  				this.renderer.removeClass(this.btnChangeEmail.nativeElement, 'btn-danger')
  				this.renderer.addClass(this.btnChangeEmail.nativeElement, 'btn-success')
  				this.renderer.setValue(this.btnChangeEmail.nativeElement.childNodes[0], 'Change')
  			}
  			break;
  		
  	}

  }

  public togglePasswordChangeContainer(){
  	console.log('scrollHeight', this.passwordChangeContainer.nativeElement.scrollHeight);
  	console.log('offsetHeight', this.passwordChangeContainer.nativeElement.offsetHeight);
    console.log('just height', this.passwordChangeContainer.nativeElement.style.height);
  	// offsetHeight properti koristis za dobavljanje visine prikazanog elementa (vidi ovo, tu imas sve https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements)
  	if(this.passwordChangeContainer.nativeElement.offsetHeight !== 0){
  		// DAKLE, NE OVAKO: this.renderer.removeClass(this.passwordChangeContainer.nativeElement, 'showPasswordChangeContainer')
  		// Dakle, ne moras u CSS-u zadavati tacnu visinu elementa, pa onda ovde toggleovati tu klasu, vec se dimenzije elementa koje nisu prikazane na stranici, mogu dobaviti preko propertija scrollHeight ko sto vidis iz prilozenog (vidi i ovaj link, tu imas sve https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements)! I ovo je po meni najjednostavniji i za sad najbolji nacin da se odradi toggle slide nekog elementa: Dakle u css-u se samo zada tranzicija za height i doda se overflow: hidden na element, a zatim se animacija odvija tako sto se toggluje height sa nule na visinu koju element ima kad je u potpunosti prikazan. Da ne bi morao da tu visinu dobavljas iz inspektora pa da je eksplicitno navodis, mozes je dobaviti preko propertija scrollHeight sto ovde i radim (ps moras navesti visinu u pikselima, tj mozda moze jos neka merna jedinica, ali mora biti brojevna vrednost, sa height: auto ti animacija nece raditi!)! I to je sve sto je potrebno za toggle slide i slide uopste nekog elementa!
  		this.renderer.setStyle(this.passwordChangeContainer.nativeElement, 'height', 0)
  		this.user.password = ''
  		this.user.confirmPassword = ''
      // Doduse ne treba ti ovaj blur zato sto ga disableujes, ali cisto da znas da se skidanje fokusa sa elementa tako radi (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/blur)
      this.passwordInput.nativeElement.blur()
      this.confirmPasswordInput.nativeElement.blur()
      this.renderer.setAttribute(this.passwordInput.nativeElement, 'disabled', 'disabled')
      this.renderer.setAttribute(this.confirmPasswordInput.nativeElement, 'disabled', 'disabled')
  		this.renderer.removeClass(this.btnChangePassword.nativeElement, 'btn-danger')
  		this.renderer.addClass(this.btnChangePassword.nativeElement, 'btn-success')
  		this.renderer.setValue(this.btnChangePassword.nativeElement.childNodes[0], 'Change your password')
  	}else{
  		// DAKLE, NE OVAKO: this.renderer.addClass(this.passwordChangeContainer.nativeElement, 'showPasswordChangeContainer')
  		
  		this.renderer.setStyle(this.passwordChangeContainer.nativeElement, 'height', String(this.passwordChangeContainer.nativeElement.scrollHeight) + 'px')
      this.renderer.removeAttribute(this.passwordInput.nativeElement, 'disabled')
      this.renderer.removeAttribute(this.confirmPasswordInput.nativeElement, 'disabled')
      this.passwordInput.nativeElement.focus()
  		this.renderer.removeClass(this.btnChangePassword.nativeElement, 'btn-success')
  		this.renderer.addClass(this.btnChangePassword.nativeElement, 'btn-danger')
  		this.renderer.setValue(this.btnChangePassword.nativeElement.childNodes[0], 'Cancel')
  	}
  }

}
