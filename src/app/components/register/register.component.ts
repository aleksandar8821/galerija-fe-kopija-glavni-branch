import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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
  public uploadImageError: string
  public removeUploadImageErrorTimeout: any
  @ViewChild("uploadImageErrorDiv") uploadImageErrorDiv: ElementRef


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

      //Ovo je kod koji omogucava da se jednom izvrsena css animacija nad elementom ponovo izvrsi, bez ovoga kad bi animacija odradila jednom svoje, vise ne bi mogao ponovo da je pokrenes, tj restartujes. Ima o ovome na netu samo trazi restart css animation(super link npr https://css-tricks.com/restart-css-animation/). Inace ovaj kod je nadjen na ovom linku https://stackoverflow.com/questions/6268508/restart-animation-in-css3-any-better-way-than-removing-the-element, u odgovoru od usera po imenu user.
      this.renderer.setStyle(this.uploadImageErrorDiv.nativeElement, 'animation', 'none')
      this.uploadImageErrorDiv.nativeElement.offsetHeight /* s ovom linijom koda triggerujes taj neki reflow, ovde imas sve te neke stvari koje trigeruju taj reflow https://gist.github.com/paulirish/5d52fb081b3570c81e3a */
      this.renderer.setStyle(this.uploadImageErrorDiv.nativeElement, 'animation', null)

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

	constructor(
		private router: Router,
		private authService: AuthService,
    private renderer: Renderer2
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


  public registerWithProfileImage() {
    let userData = new FormData();
    userData.append('first_name', this.user.firstName)
    userData.append('last_name', this.user.lastName)
    userData.append('email', this.user.email)
    userData.append('password', this.user.password)
    userData.append('password_confirmation', this.user.confirmPassword)
    userData.append('accepted_terms', (Number(this.user.acceptedTerms)).toString()) //Ovo sa Number().toString() radim da bi od booleana dobio prvo 1 ili 0, pa onda sa toString() ga pretvaram u string da bi mogao da ga stavim u FormData objekat. Jedan od razloga sto ga konvertujem u "1" ili "0" je taj sto cu na laravelu koristiti accepted validator koji moze da radi izmedju ostalog i sa 1 i 0, pa na ovaj nacin to omogucujem

    // Posto je this.croppedImage u base64 string formatu, ona se salje isto kao i svaki drugi string (vidi https://stackoverflow.com/questions/26667820/upload-a-base64-encoded-image-using-formdata)
    if(this.croppedImage)
    userData.append('profile_image', this.croppedImage)

    this.authService.registerWithProfileImage(userData).subscribe(() => {
      this.router.navigateByUrl('/login'); //ovo ti i ne biva okinuto (doduse i ne treba) jer funkcija na koju si se subscribeovao ne vraca nista preko o.next
    }, (err: HttpErrorResponse) => {
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
