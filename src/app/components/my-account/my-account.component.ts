import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user';
import { FormControl, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

// Na ovaj nacin mozes koristiti jQuery! Samo prethodno treba da ti je instaliran, sto sam ja uradio kad sam instalirao bootstrap, ovde ga deklarises i to je SVE!. Isto ovako radi ovaj lik https://www.youtube.com/watch?v=mAwqk-eIPL8 , slicno ovaj sa jos nekim zanimljivim informacijama https://www.youtube.com/watch?v=vrdHEBkGAow . Ovo je malko drugacije al slicno https://medium.com/@swarnakishore/how-to-include-and-use-jquery-in-angular-cli-project-592e0fe63176 . Postoji i nacin gde uvodis tipove za jQuery pa onda valjda ne moras da radis ovaj declare ko sad sto radis, vidi https://stackoverflow.com/questions/42510334/how-to-include-jquery-properly-in-angular-cli-1-0-0-rc-0 , https://stackoverflow.com/questions/43934727/how-to-use-jquery-plugin-with-angular-4 - odgovor od Ervin Llojku, opet slicno https://stackoverflow.com/questions/39511788/how-to-import-jquery-to-angular2-typescript-projects , itd
// declare var $:any;
// Mozda bolje ovako, jer ovaj dolar ipak koristis za $event npr, pa da ne dodje do nekog konflikta (ne znam da li bi doslo, al za svaki slucaj), a tako radi i ovaj lik (https://www.youtube.com/watch?v=vrdHEBkGAow) koji je mozda i najpouzdaniji:
declare var jQuery:any;

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
  public unchangedUserFormData: Array<any>
  public formDataChanged: boolean = false
  public passwordChangeContainerOpened: boolean = false
  public targetClickedOnBody: any
  public sendData: FormData
  public reEnteredPassword: string;
  /*
  //KOD KOJI ONEMOGUCAVA DA SE UNESE SIFRA ZAPAMCENA OD STRANE BROWSERA
  public reEnteredPasswordFormSubscription: Subscription;*/

  // Ovu formu sam krenuo da radim po ovom tutorijalu https://www.youtube.com/watch?v=kFjjr2CRVUI gde on grupise kontrole, pa otud meni ova zasebna grupa ovde changePassword: new FormGroup, inace msm da mi to ovde i nije bas potrebno, jer kolko se secam Strainja iz Panonita je rekao, da inpute ima smisla grupisati jedino ako je veca forma u pitanju. Msm da je jos jedini link sa kojeg sam radio ovaj uvodni deo u angular reactive iliti model driven forme ovaj https://angular.io/guide/reactive-forms
  public updateAccountDataForm = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    email: new FormControl(),
    changePassword: new FormGroup({
      // Moram ovde da postavim disabled atribut, ne moze unutar templatea kad se radi sa reactive formama u angularu, tako je neko pravilo jbg... PS PAZI!!! DA BI TI OVO POLJE FUNKCIONISALO MORAS GA KASNIJE ENABLEOVATI, ALI NE PREKO RENDERERA ILI PREKO DOM MANIPULACIJE NEKAKVE, NEGO PREKO METODA enable() i disable() (vidi https://netbasal.com/disabling-form-controls-when-working-with-reactive-forms-in-angular-549dd7b42110) koje pozivas nad poljima forme (iliti kontrolama - control, kako se ovde nazivaiju)
      password: new FormControl({value:'', disabled: true}),
      confirmPassword: new FormControl({value:'', disabled: true})
    }),
    profileImage: new FormControl()
  })

  // Polja iz forme
  public firstName = this.updateAccountDataForm.get('firstName')
  public lastName = this.updateAccountDataForm.get('lastName')
  public email = this.updateAccountDataForm.get('email')
  public password = this.updateAccountDataForm.controls.changePassword.get('password')
  public confirmPassword = this.updateAccountDataForm.controls.changePassword.get('confirmPassword')
  public profileImage = this.updateAccountDataForm.get('profileImage')


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
  @ViewChild("passwordModal") passwordModal: ElementRef
  @ViewChild("passwordModalButtonTrigger") passwordModalButtonTrigger: ElementRef
  @ViewChild("reEnteredPasswordInput") reEnteredPasswordInput: ElementRef
  @ViewChild("reEnteredPasswordForm") reEnteredPasswordForm: NgForm

  @ViewChild("progressBar") progressBar: ElementRef
  public disableProgressBar: number = 0
  @ViewChild("disabledOverlay") disabledOverlay: ElementRef

  @ViewChild("modalCloseButton") modalCloseButton: ElementRef
  @ViewChild("modalSubmitButton") modalSubmitButton: ElementRef
  @ViewChild("modalCancelButton") modalCancelButton: ElementRef

	public loggedUserExsistingProfileImage = window.localStorage.getItem('loggedUserProfileImage')
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
        // Dodato za validaciju za angular reactive forme:
        this.updateAccountDataForm.patchValue({
          profileImage: null
        })
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
      // Dodato za validaciju za angular reactive forme:
      this.updateAccountDataForm.patchValue({
        profileImage: null
      })


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
    // Dodato za validaciju za angular reactive forme:
    this.updateAccountDataForm.patchValue({
      profileImage: null
    })
	}
	/* ************************************************ */

  constructor(private authService: AuthService, private renderer: Renderer2, private router: Router) { }

  ngOnInit() {
  	this.authService.getUserInfo().subscribe((loggedUser) => {
  		console.log(loggedUser)
  		this.user = new User(loggedUser.id, loggedUser.first_name, loggedUser.last_name, loggedUser.email, loggedUser.profile_image)
  		// Moram praviti dva odvojena objekta, jer kod objekata vazi by reference pravilo, ne mogu napraviti jedan pa ih dodati ostalima onda bi imao samo jedan objekat na kojeg ostali referenciraju. Ovako imam dva odvojena objekta. PS OVO MI KOD REACTIVE FORME NE TREBA, JER KOD NJE NE POSTOJI TWO WAY DATA BINDING, ALI CU IPAK OSTAVITI DA OVDE STOJI DA NE BI MORAO SAD POLA KODA DA BRISEM I PRILAGODJAVAM
  		this.unchangedUserData = new User(loggedUser.id, loggedUser.first_name, loggedUser.last_name, loggedUser.email, loggedUser.profile_image)
  		this.userDataReceived = true

      // Nakon sto dobavim podatke o ulogovanom useru sa servera, njima popunjavam sledeca polja forme. Tutorijal za metode setValue i patchValue: https://toddmotto.com/angular-2-form-controls-patch-value-set-value
      this.updateAccountDataForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email
      })


      // Sa concat metodom spajas dva niza u javascriptu (https://davidwalsh.name/combining-js-arrays , https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items , https://medium.com/@Andela/combining-arrays-in-javascript-3b1b9cf874a1)
      /*this.unchangedUserFormData = Object.values(this.updateAccountDataForm.value).concat(Object.values(this.updateAccountDataForm.controls.changePassword.value))*/

      // getRawValue() metoda vraca sve podatke iz forme, pa cak i iz disabled polja
      this.unchangedUserFormData = this.updateAccountDataForm.getRawValue()


      // Ovakav subscribe radi i ovaj https://medium.com/@luukgruijs/validating-reactive-forms-with-default-and-custom-form-field-validators-in-angular-5586dc51c4ae . PS dobro je verovatno sto ti ovaj subscribe stoji bas ovde, on ce bez obzira sto se nalazi u success handleru drugog subscribea ostati aktivan tokom celog zivota komponente, a dobro je sto ti stoji ovde zato sto ce gledati promene u odnosu na podatke koji ti prvobitno stizu sa servera unutar pomenutog success handlera
      this.updateAccountDataForm.valueChanges.subscribe((data) => {
        // Podaci koje vraca valueChanges properti na kojeg se suscribeujem (nazalost ne vraca mi podatke iz polja forme koja su u novoj zasebnoj grupi koja se zove changePassword (KASNIJE SKONTAO, NIJE IH VRACAO ZATO STO SU BILE DISABLED, getRawValue() metoda vraca i disabled polja), ali se valueChanges ipak trigeruje kad se podaci u ovoj grupi promene!
        // console.log('Podaci koje vraca valueChanges properti na kojeg se suscribeujem (nazalost ne vraca mi podatke iz polja forme koja su u novoj zasebnoj grupi koja se zove changePassword (KASNIJE SKONTAO, NIJE IH VRACAO ZATO STO SU BILE DISABLED, getRawValue() metoda vraca i disabled polja), ali se valueChanges ipak trigeruje kad se podaci u ovoj grupi promene!)', data);
        
        // Ovde su ocigledno prisutni svi podaci (ukljucujuci i disabled polja)
        // console.log('Ovde su ocigledno prisutni svi podaci (ukljucujuci i disabled polja)', this.updateAccountDataForm.getRawValue());
        
        // Ovde su prisutni samo podaci iz grupe changePassword
        // console.log('Ovde su prisutni podaci iz grupe changePassword', this.updateAccountDataForm.controls.changePassword.value);

        console.log('Is form valid?', this.updateAccountDataForm.valid);


        /* ************* OVAJ DEO IZBACUJEM ************ */

        /* Ovako se ipak ne moze raditi jer value properti forme ne vraca podatke iz disabled polja i onda se ne porede nizovi (unchanged i changed) sa istim brojem clanova */

        /*let changedUserFormData = Object.values(this.updateAccountDataForm.value).concat(Object.values(this.updateAccountDataForm.controls.changePassword.value))
        console.log(changedUserFormData);

        for (var i = 0; i < changedUserFormData.length; i++) {
          // Ovaj uslov zapravo detektuje promenu u formi u odnosu na ono kakva je bila na samom pocetku, i to ne promenu iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl)
          if((changedUserFormData[i] !== this.unchangedUserFormData[i]) && changedUserFormData[i]){
            this.formDataChanged = true
            console.log('promena!');
            break
          }else{
            this.formDataChanged = false
          }
        }*/

        /* ************************************************* */

        let changedUserFormData = this.updateAccountDataForm.getRawValue()
        // Ova petlja sluzi za proveru da vidis da li se ista promenilo od pocetnih vrednosti forme i to ne iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl), i prilicno je REUSABLE (recimo)
        /* Break nested for loops:
        https://stackoverflow.com/questions/183161/best-way-to-break-from-nested-loops-in-javascript - pretpostavljam da ti je dovoljan ovaj prihvacen odgovor (ako ti odgovara taj nacin ovde imas jos nekih dodatnih informacija, ako ti uopste trebaju https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label , https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break), ali postoji jos par fora, npr sa return, a mozes i ako si u for petlji da podesis onaj var i na vrednost koja ce ga naterati da iskoci iz petlje i tako imas slicnih fora
         */
        parentloop:
        for(const prop in changedUserFormData){
          // Moram na pocetku da proveravam ove nested objekte iz razloga zato sto ovi objekti iako imaju potpuno iste vrednosti opet ako ih uporedis javascript ce ti vratiti false (moras im proveravati propertije jedan po jedan ako hoces da ih uporedis). Tako da ne smem da pustim da mi se u sadasnjem else if delu (else if delovima kako god) koda proveravaju bilo kakkvi objekti (jer bi ti dva potpuno jednaka objekta (sa potpuno jednakim vrednostima) on protumacio kao nejednake i uslov bi prosao). Time sto kao prvi if navodim proveru za objekte, u else if delu koda se ne mogu naci objekti i time je to reseno
          if(typeof changedUserFormData[prop] === 'object'){
            for(const nestedProp in changedUserFormData[prop]){
              // Ovaj uslov zapravo detektuje promenu u formi u odnosu na ono kakva je bila na samom pocetku, i to ne promenu iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl)
              if(changedUserFormData[prop][nestedProp] && (changedUserFormData[prop][nestedProp] !== this.unchangedUserFormData[prop][nestedProp])){
                console.log('Promenjena pocetna vrednost nekog od polja unutar nested form grupe (passworda ili confirm passworda)');
                this.formDataChanged = true
                break parentloop
              }
            }
          }
          // Ispitivanje za sliku mora ici u zaseban blok koda, jer je njoj pocetna vrednost null, a nad nullom se ne moze izvrsiti trim() ko sto radim u narednom else if
          else if(prop === 'profileImage'){
            if(changedUserFormData[prop] !== null){
              this.formDataChanged = true;
              console.log('Promenjena pocetna vrednost slike!');
              break
            }
          }
          // Ovaj uslov zapravo detektuje promenu u formi u odnosu na ono kakva je bila na samom pocetku, i to ne promenu iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl)
          else if(changedUserFormData[prop].trim() && (changedUserFormData[prop].trim() !== this.unchangedUserFormData[prop].trim())) {
            this.formDataChanged = true
            console.log('Promenjena pocetna vrednost nekog od polja koja nisu unutar zasebne nested form grupe (osim slike, dakle: imena, prezimena ili maila)');
            break
          }else{
            this.formDataChanged = false
            console.log('Nista nije promenjeno od pocetnih vrednosti');
          }

        }

      })

  	})
    
    // Ovako fokusiras polje unutar bootstrap modala, imas na bootstrap dokumentaciji ovo. Gore u kodu ti je objasnjenje kako ubaciti jQuery u angular!
    jQuery('#exampleModal').on('shown.bs.modal', function () {
      jQuery('#reEnteredPassword').trigger('focus')
    })

  }

  public changeInputToggle(event){
  	switch (event.target.id) {
  		case "btnChangeFirstName":
  			if (this.firstNameInput.nativeElement.readOnly) {
          this.firstName.markAsUntouched() //User ce ti cesto kliknuti prvo na readonly polje sto ce se racunati kao touched, pa kasnije kad klikne na change odmah ce im iskociti greska. Ovim to sprecavam
  				this.renderer.removeAttribute(this.firstNameInput.nativeElement, 'readonly')
          // this.user.firstName = ''
          // Ovo je jako bitno, moras prvo ovde da stavis required validator, pa tek onda da ga podesavas na prazan string, u suprotnom ti nece raditi required odmah
          this.firstName.setValidators([Validators.required, Validators.pattern('.*\\S+.*')/*Ovo je pattern za to da ne mozes da unosis samo whitespace nego da mora da bude bar nekog konkretnog sadrzaja, neki znak, bilo sta. Odgovor nasao na jedvite jade ovde, vidi odgovor od Serg Chernata: https://stackoverflow.com/questions/41622490/how-to-add-pattern-to-validate-not-white-spaces-only-in-html-pattern , INACE mogao si ovo lako uraditi sa custom validatorom gde bi samo napisao if(string.trim()) pa ako ovo vrati true, string je validan*/, this.validateSameValue.bind(this)]) // Ovde moras da koristis ovaj bind, da bi na doticni validator prosledio this koji ce oznacavati ovu komponentu, jer kolko vidim njemu je po defaultu this undefined unutar validatora! Pokupio ovde https://stackoverflow.com/questions/48785362/angular-4-validator-custom-function-this-is-undefined . 
          this.updateAccountDataForm.patchValue({
            firstName: ''
          })

  				this.firstNameInput.nativeElement.focus()
  				this.renderer.removeClass(this.btnChangeFirstName.nativeElement, 'btn-success')
  				this.renderer.addClass(this.btnChangeFirstName.nativeElement, 'btn-danger')
  				this.renderer.setValue(this.btnChangeFirstName.nativeElement.childNodes[0], 'Cancel')
  			}else{
  				// console.log(this.unchangedUserData);
  				this.renderer.setAttribute(this.firstNameInput.nativeElement, 'readonly', 'readonly')
          this.firstName.clearValidators()
          // this.user.firstName = this.unchangedUserData.firstName
          this.updateAccountDataForm.patchValue({
            firstName: this.unchangedUserData.firstName
          })
          this.firstName.markAsPristine()
          this.firstName.markAsUntouched()

  				this.renderer.removeClass(this.btnChangeFirstName.nativeElement, 'btn-danger')
  				this.renderer.addClass(this.btnChangeFirstName.nativeElement, 'btn-success')
  				this.renderer.setValue(this.btnChangeFirstName.nativeElement.childNodes[0], 'Change')
  			}
  			break;

  		case "btnChangeLastName":
  			if (this.lastNameInput.nativeElement.readOnly) {
          this.lastName.markAsUntouched() //User ce ti cesto kliknuti prvo na readonly polje sto ce se racunati kao touched, pa kasnije kad klikne na change odmah ce im iskociti greska. Ovim to sprecavam
  				this.renderer.removeAttribute(this.lastNameInput.nativeElement, 'readonly')
  				// this.user.lastName = ''
          // Ovo je jako bitno, moras prvo ovde da stavis required validator, pa tek onda da ga podesavas na prazan string, u suprotnom ti nece raditi required odmah
          this.lastName.setValidators([Validators.required, Validators.pattern('.*\\S+.*')/*Ovo je pattern za to da ne mozes da unosis samo whitespace nego da mora da bude bar nekog konkretnog sadrzaja, neki znak, bilo sta. Odgovor nasao na jedvite jade ovde, vidi odgovor od Serg Chernata: https://stackoverflow.com/questions/41622490/how-to-add-pattern-to-validate-not-white-spaces-only-in-html-pattern , INACE mogao si ovo lako uraditi sa custom validatorom gde bi samo napisao if(string.trim()) pa ako ovo vrati true, string je validan*/, this.validateSameValue.bind(this)]) // Ovde moras da koristis ovaj bind, da bi na doticni validator prosledio this koji ce oznacavati ovu komponentu, jer kolko vidim njemu je po defaultu this undefined unutar validatora! Pokupio ovde https://stackoverflow.com/questions/48785362/angular-4-validator-custom-function-this-is-undefined .
          this.updateAccountDataForm.patchValue({
            lastName: ''
          })

  				this.lastNameInput.nativeElement.focus()
  				this.renderer.removeClass(this.btnChangeLastName.nativeElement, 'btn-success')
  				this.renderer.addClass(this.btnChangeLastName.nativeElement, 'btn-danger')
  				this.renderer.setValue(this.btnChangeLastName.nativeElement.childNodes[0], 'Cancel')
  			}else{
  				this.renderer.setAttribute(this.lastNameInput.nativeElement, 'readonly', 'readonly')
          this.lastName.clearValidators()
          // this.user.lastName = this.unchangedUserData.lastName
          this.updateAccountDataForm.patchValue({
            lastName: this.unchangedUserData.lastName
          })
          this.lastName.markAsPristine()
          this.lastName.markAsUntouched()

  				this.renderer.removeClass(this.btnChangeLastName.nativeElement, 'btn-danger')
  				this.renderer.addClass(this.btnChangeLastName.nativeElement, 'btn-success')
  				this.renderer.setValue(this.btnChangeLastName.nativeElement.childNodes[0], 'Change')
  			}
  			break;

  		case "btnChangeEmail":
  			if (this.emailInput.nativeElement.readOnly) {
          this.email.markAsUntouched() //User ce ti cesto kliknuti prvo na readonly polje sto ce se racunati kao touched, pa kasnije kad klikne na change odmah ce im iskociti greska. Ovim to sprecavam
  				this.renderer.removeAttribute(this.emailInput.nativeElement, 'readonly')
  				// this.user.email = ''
          // Ako hoces da stavljas vise validatora na jedno polje, MORAS ih ovako proslediti kao niz, drugacije NE MOZE
          // Ovo je jako bitno, moras prvo ovde da stavis required validator, pa tek onda da ga podesavas na prazan string, u suprotnom ti nece raditi required odmah
          this.email.setValidators([Validators.required, Validators.pattern('.*\\S+.*')/*Ovo je pattern za to da ne mozes da unosis samo whitespace nego da mora da bude bar nekog konkretnog sadrzaja, neki znak, bilo sta. Odgovor nasao na jedvite jade ovde, vidi odgovor od Serg Chernata: https://stackoverflow.com/questions/41622490/how-to-add-pattern-to-validate-not-white-spaces-only-in-html-pattern , INACE mogao si ovo lako uraditi sa custom validatorom gde bi samo napisao if(string.trim()) pa ako ovo vrati true, string je validan*/, Validators.email, this.validateSameValue.bind(this)]) // Ovde moras da koristis ovaj bind, da bi na doticni validator prosledio this koji ce oznacavati ovu komponentu, jer kolko vidim njemu je po defaultu this undefined unutar validatora! Pokupio ovde https://stackoverflow.com/questions/48785362/angular-4-validator-custom-function-this-is-undefined .
          this.updateAccountDataForm.patchValue({
            email: ''
          })

  				this.emailInput.nativeElement.focus()
  				this.renderer.removeClass(this.btnChangeEmail.nativeElement, 'btn-success')
  				this.renderer.addClass(this.btnChangeEmail.nativeElement, 'btn-danger')
  				this.renderer.setValue(this.btnChangeEmail.nativeElement.childNodes[0], 'Cancel')
  			}else{
  				this.renderer.setAttribute(this.emailInput.nativeElement, 'readonly', 'readonly')
          this.email.clearValidators()
          // this.user.email = this.unchangedUserData.email
          this.updateAccountDataForm.patchValue({
            email: this.unchangedUserData.email
          })
          this.email.markAsPristine()
          this.email.markAsUntouched()

  				this.renderer.removeClass(this.btnChangeEmail.nativeElement, 'btn-danger')
  				this.renderer.addClass(this.btnChangeEmail.nativeElement, 'btn-success')
  				this.renderer.setValue(this.btnChangeEmail.nativeElement.childNodes[0], 'Change')
  			}
  			break;
  		
  	}

  }

  public togglePasswordChangeContainer(){
  	/*console.log('scrollHeight', this.passwordChangeContainer.nativeElement.scrollHeight);
  	console.log('offsetHeight', this.passwordChangeContainer.nativeElement.offsetHeight);
    console.log('just height', this.passwordChangeContainer.nativeElement.style.height);*/
  	// offsetHeight properti koristis za dobavljanje visine prikazanog elementa (vidi ovo, tu imas sve https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements)
  	if(this.passwordChangeContainer.nativeElement.offsetHeight !== 0){
  		// DAKLE, NE OVAKO, (nego koristis scrollHeight property elementa, vidi https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements): this.renderer.removeClass(this.passwordChangeContainer.nativeElement, 'showPasswordChangeContainer')
  		// Dakle, ne moras u CSS-u zadavati tacnu visinu elementa, pa onda ovde toggleovati tu klasu, vec se dimenzije elementa koje nisu prikazane na stranici, mogu dobaviti preko propertija scrollHeight ko sto vidis iz prilozenog (vidi i ovaj link, tu imas sve https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements)! I ovo je po meni najjednostavniji i za sad najbolji nacin da se odradi toggle slide nekog elementa: Dakle u css-u se samo zada tranzicija za height i doda se overflow: hidden na element, a zatim se animacija odvija tako sto se toggluje height sa nule na visinu koju element ima kad je u potpunosti prikazan. Da ne bi morao da tu visinu dobavljas iz inspektora pa da je eksplicitno navodis, mozes je dobaviti preko propertija scrollHeight sto ovde i radim (ps moras navesti visinu u pikselima, tj mozda moze jos neka merna jedinica, ali mora biti brojevna vrednost, sa height: auto ti animacija nece raditi!)! I to je sve sto je potrebno za toggle slide i slide uopste nekog elementa!
      this.renderer.setStyle(this.passwordChangeContainer.nativeElement, 'height', String(this.passwordChangeContainer.nativeElement.offsetHeight) + 'px')// Posto sam pri slide downu morao nakon zavrsetka slide downa preimenovati height u auto, da bi mi mogle stati validacione greske u kontejener, sada ga pre nego sto pocne slide up moram ovde prebaciti na konkretnu vrednost u pikselima, jer samo sa njima animacija hoce da radi

      console.log(this.passwordChangeContainer.nativeElement.style.height === 'auto'); // console.log je kolko znam asinhron pa ce ti ovde uvek izbaciti true

      // Pomocu ovog intervala postizem da mi se animacija slajda nagore pocne odvijati tek kad div koji se animira primi ovu konkretnu offsetHeight visinu u pikselima, jer se vrednost auto ne moze animirati. Fora je u tome sto pomenuti div ne prima odmah ovu konkretnu visinu u pikselima cim je setujem ovde u kodu iznad, nego malo kasni, pa moram malo da odlozim izvrsavanje animacije i to ide po meni ovako najelegantnije. Jer setinterval proverava stalno i kad se uslov zadovolji prestaje da se vrti, dok settimeout treba otprilike da namestim i nikad nisam siguran dal sam bas dobro vreme podesio. Set interval je u ovom slucaju sto posto siguran.  
      let interval = setInterval(() => {
        if(this.passwordChangeContainer.nativeElement.style.height !== 'auto'){

          clearInterval(interval)

          this.renderer.setStyle(this.passwordChangeContainer.nativeElement, 'height', 0)
          /*this.user.password = ''
          this.user.confirmPassword = ''*/
          // Tutorijal za metode setValue i patchValue: https://toddmotto.com/angular-2-form-controls-patch-value-set-value
          this.updateAccountDataForm.patchValue({
            changePassword:{
              password: '',
              confirmPassword: ''
            }
          })

          this.password.markAsPristine()
          this.password.markAsUntouched()
          this.password.clearValidators()

          this.confirmPassword.markAsPristine()
          this.confirmPassword.markAsUntouched()
          this.confirmPassword.clearValidators()

          // Doduse ne treba ti ovaj blur zato sto ga disableujes, ali cisto da znas da se skidanje fokusa sa elementa tako radi (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/blur)
          this.passwordInput.nativeElement.blur()
          this.confirmPasswordInput.nativeElement.blur()
          /*this.renderer.setAttribute(this.passwordInput.nativeElement, 'disabled', 'disabled')
          this.renderer.setAttribute(this.confirmPasswordInput.nativeElement, 'disabled', 'disabled')*/
          // https://netbasal.com/disabling-form-controls-when-working-with-reactive-forms-in-angular-549dd7b42110
          this.password.disable()
          this.confirmPassword.disable()

          this.renderer.removeClass(this.btnChangePassword.nativeElement, 'btn-danger')
          this.renderer.addClass(this.btnChangePassword.nativeElement, 'btn-success')
          this.renderer.setValue(this.btnChangePassword.nativeElement.childNodes[0], 'Change your password')
        }
       
      }, 20)

      
  	}else{
  		// DAKLE, NE OVAKO, (nego koristis scrollHeight property elementa, vidi https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements): this.renderer.addClass(this.passwordChangeContainer.nativeElement, 'showPasswordChangeContainer')
      this.renderer.setStyle(this.passwordChangeContainer.nativeElement, 'height', String(this.passwordChangeContainer.nativeElement.scrollHeight) + 'px')
      // OVO NE RADI, KAZE DA JE offsetHeight readonly property! this.renderer.setProperty(this.passwordChangeContainer.nativeElement, 'offsetHeight', String(this.passwordChangeContainer.nativeElement.scrollHeight) + 'px')

      // Pomocu ovog intervala proveravam da li je animacija slajda nadole zaista gotova i tek kad je gotova dodajem divu visinu auto, da bi greske validacije mogle mu povecaju visinu automatski, a ne da mu ostane fiksna visina jer onda nema mesta za validacione greske. Pretpostavljam elegantnije i pouzdanije od varijante gde u setTimeout stavis vreme animacije, mada moze i tako (dodao kasnije: bas i ne mora da znaci! ukoliko ti se desi da ti se visina diva moze promeniti U TOKU animacije, onda ti setinterval nece uraditi posao uopste! jer mu se ovaj uslov koji proverava nece zadovoljiti nikad, pa u tom slucaju koristi setTimeout! Sad sam inace namestio da mi se visina diva ne moze promeniti tokom animacije tj. ne mogu mi iskakati validacione greske pre nego sto mi se slide down potpuno ne zavrsi, tako da setInterval ovde radi dobar posao - bar zasad)
      let interval = setInterval(() => {
        if(this.passwordChangeContainer.nativeElement.offsetHeight === this.passwordChangeContainer.nativeElement.scrollHeight){
          clearInterval(interval)
          this.renderer.setStyle(this.passwordChangeContainer.nativeElement, 'height', 'auto')
          /*this.renderer.removeAttribute(this.passwordInput.nativeElement, 'disabled')
          this.renderer.removeAttribute(this.confirmPasswordInput.nativeElement, 'disabled')*/
          
          this.password.setValidators([Validators.required, Validators.minLength(8),/*Ovaj vivifyev pattern (\w*[0-9]{1,}\w*) ipak ne valja jer vrsi restrikciju i na whitespace i trazi bar jedan broj. Kao sto vidis stavljam novi (.*[0-9].* - nasao ovde https://stackoverflow.com/questions/17342626/regular-expression-for-at-least-one-number)  Validators.pattern("\\w*[0-9]{1,}\\w*")]) //Backslash moras ovde da eskejpujes sa dodatnim backslashom <<< vidi sta kaze James Ellis-Jones ovde https://stackoverflow.com/questions/42392373/angular-2-validators-pattern-not-working + imas na ovom linku jos neke zackoljice oko ovih regexa*/ Validators.pattern(".*[0-9].*")])

          this.confirmPassword.setValidators(Validators.required)

          // https://netbasal.com/disabling-form-controls-when-working-with-reactive-forms-in-angular-549dd7b42110
          this.password.enable()
          this.confirmPassword.enable()


          this.passwordInput.nativeElement.focus()
        }
      }, 20)
      
  		this.renderer.removeClass(this.btnChangePassword.nativeElement, 'btn-success')
  		this.renderer.addClass(this.btnChangePassword.nativeElement, 'btn-danger')
  		this.renderer.setValue(this.btnChangePassword.nativeElement.childNodes[0], 'Cancel')
  	}
  }

  // Pomocu ove funkcije resavam to da mi validacione greske ne iskacu kad stisnem cancel dugme polja, jer se one okidaju u sustini kad im se na poljima okine blur dogadjaj, sto ti i kaze ovde " The checks for dirty and touched prevent errors from showing until the user does one of two things: changes the value, turning the control dirty; or blurs the form control element, setting the control to touched." - https://angular.io/guide/form-validation
  public inputBlurHandler(event){

    // Ovde pravim mali izuzetak i ovo handlujem van onog switcha dole i naravno pre provere da li event.relatedTarget ne postoji jer mi je ovde i taj slucaj potreban. Dakle ovim postizem da kada mi user validno popuni sifru, pa klikne negde van (osim na samo polje confirm passworda ili dugme cancel) da se pojavi greska ispod confirm passworda da polje mora da se popuni! Jer je greska ako validno popunis sifru pa kliknes bilo gde drugde osim na confirm password
    if(event.target.id === "password"){
      if(event.relatedTarget){
        if(event.relatedTarget.id !== "password_confirmation" && event.relatedTarget.id !== "btnChangePassword" && this.password.valid && this.confirmPassword.hasError('required')){
          this.confirmPassword.markAsTouched()
        }
      }else if(this.password.valid && this.confirmPassword.hasError('required')){
        this.confirmPassword.markAsTouched()
      }
    }

    // Nekad je relatedTarget null pa mi izbacuje gresku, pa da me ne bi jebavao vise u zdrav mozak, ovde ga odmah izbacujem ako nema relatedTarget
    if(!event.relatedTarget){
      return;
    }

    switch (event.target.id) {
      case "firstName":
        if(event.relatedTarget.id === "btnChangeFirstName"){
          this.firstName.markAsUntouched()
        }
      break;

      case "lastName":
        if(event.relatedTarget.id === "btnChangeLastName"){
          this.lastName.markAsUntouched()
        }
      break;

      case "email":
        if(event.relatedTarget.id === "btnChangeEmail"){
          this.email.markAsUntouched()
        }
      break;

      case "password":
        if(event.relatedTarget.id === "btnChangePassword"){
          this.password.markAsUntouched()
          console.log('Blur na password');
        }
      break;

      case "password_confirmation":
        if(event.relatedTarget.id === "btnChangePassword"){
          this.confirmPassword.markAsUntouched()
        }
      break;

    }
    
  }

  // Kao sto vidis custom validator funkcije mogu komontno da stoje ovde u komponenti, tako npr radi i ovaj pajvan https://www.youtube.com/watch?v=YCEk1kGWb6A . Inace ovu custom validaciju imas na zvanicnoj dokumentaciji https://angular.io/guide/form-validation#custom-validators , jedino je mozda samo pisanje validatora malo nejasno, ali vidi ovaj prvi video sto si naveo, zatim bookmarkse i google i msm da ces brzo sve skontati. Cak ti je mozda i ova funkcija ovde koju si napisao najbolje objasnjenje. Ono sto ona radi je to da pravi restrikciju da vrednost input polja ne sme biti jednako pocetnoj vrednosti polja
  public validateSameValue(control: FormControl){
    /* ****** Na ovaj nacin se dobavlja ime kontrole (polja, odnosno onoga sto si stavio u formControlName) koja se validira, vidi odgovor od Chris https://stackoverflow.com/questions/40361799/how-to-get-name-of-input-field-from-angular2-formcontrol-object . Msm da je ovo najjednostavnije resenje, posto ti ime po defaultu nije dostupno iz nekog debilnog razloga ****** */
    const formGroup = control.parent.controls;
    const controlName = Object.keys(formGroup).find(name => control === formGroup[name])
    /* ******************************************************** */
    if(control.value.trim() === this.unchangedUserData[controlName].trim()){
      return {sameValue: true}
    }else{
      return null
    }
  }
  
  //Ova funkcija se okida kad submitujes formu sa podacima i salje sve podatke (i sensitive tipa email, sifra i nonsensitive tipa slika) u jednom cugu. Moze se koristiti u paru sa funkcijom updateAccountDataWithReEnteredPassword, ali ne moze sa funkcijom updateAccountDataWithReEnteredPasswordAndMailConfirmation(ove funkcije navodis kao submit handlere na bootstrap modal formi). Zato preporucujem da uvek koristi updateAccountData2 umesto ove, jer ona radi sa obe navedene funkcije. Ovu funkciju ipak ostavljam zbog koda koji ti moze biti od koristi.
  public updateAccountData(){
    let sendData = new FormData()
    let changedUserFormData = this.updateAccountDataForm.getRawValue()
    console.log(changedUserFormData);
    let needPasswordReEnter: boolean = false
    let allFieldsChanged: boolean =  true //bice true ako korisnik ispuni kompletnu formu (ukljucujuci i profil sliku naravno) sa novim vrednostima. Postavljam je na true, pa ako se pri proveri ispostavi da je barem jedan podatak isti sa pocetnim bice false

    // Ova petlja sluzi za proveru da vidis da li se ista promenilo od pocetnih vrednosti forme i to ne iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl), i prilicno je REUSABLE (recimo)
    for(const prop in changedUserFormData){
      // Moram na pocetku da proveravam ove nested objekte iz razloga zato sto ovi objekti iako imaju potpuno iste vrednosti opet ako ih uporedis javascript ce ti vratiti false (moras im proveravati propertije jedan po jedan ako hoces da ih uporedis). Tako da ne smem da pustim da mi se u sadasnjem else if delu (else if delovima kako god) koda proveravaju bilo kakkvi objekti (jer bi ti dva potpuno jednaka objekta (sa potpuno jednakim vrednostima) on protumacio kao nejednake i uslov bi prosao). Time sto kao prvi if navodim proveru za objekte, u else if delu koda se ne mogu naci objekti i time je to reseno
      if(typeof changedUserFormData[prop] === 'object'){
        for(const nestedProp in changedUserFormData[prop]){
          // Ovaj uslov zapravo detektuje promenu u formi u odnosu na ono kakva je bila na samom pocetku, i to ne promenu iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl)
          if(changedUserFormData[prop][nestedProp] && (changedUserFormData[prop][nestedProp] !== this.unchangedUserFormData[prop][nestedProp])){
            needPasswordReEnter = true
            if(nestedProp === 'confirmPassword'){
              // Moram ga ovde promenuti iz confirmPassword u password_confirmation, jer Laravel za konfirmaciju sifre trazi da potvrdjena sifra ima key password_confirmation
              sendData.append('password_confirmation', changedUserFormData[prop][nestedProp])
            }else{
              sendData.append(nestedProp, changedUserFormData[prop][nestedProp])
            }
            console.log(nestedProp, changedUserFormData[prop][nestedProp]);
          }

        }
      }
      // Ispitivanje za sliku mora ici u zaseban blok koda, jer je njoj pocetna vrednost null, a nad nullom se ne moze izvrsiti trim() ko sto radim u narednom else if
      else if(prop === 'profileImage'){
        if(changedUserFormData[prop] !== null){
          // Ne stavljam changedUserFormData[prop] u sendData, nego this.croppedImage jer mi se tu nalazi base64 string koji je zapravo ta slika i to treba da se posalje na server
          sendData.append('profile_image', this.croppedImage)
          console.log(prop, this.croppedImage);
          
        }
      }
      // Ovaj uslov zapravo detektuje promenu u formi u odnosu na ono kakva je bila na samom pocetku, i to ne promenu iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl)
      else if(changedUserFormData[prop].trim() && (changedUserFormData[prop].trim() !== this.unchangedUserFormData[prop].trim())) {
        needPasswordReEnter = true
        if(prop === 'firstName'){
          sendData.append('first_name', changedUserFormData[prop].trim())
        }else if(prop === 'lastName'){
          sendData.append('last_name', changedUserFormData[prop].trim())
        }else{
          sendData.append(prop, changedUserFormData[prop].trim())
        }
        console.log(prop, changedUserFormData[prop].trim());
      }else{
        // console.log('Upade u else!');
      }

    }

    // Ova for in petlja proverava da li postoji barem jedan element forme koji je ostao nepromenjen, pa ukoliko jeste setuje se allFieldsChanged na false, a u odnosu na to ce se slati put ili patch request na server. Put ako je sve promenjeno, a patch ako je izmenjeno samo nesto!
    /* Break nested for loops:
    https://stackoverflow.com/questions/183161/best-way-to-break-from-nested-loops-in-javascript - pretpostavljam da ti je dovoljan ovaj prihvacen odgovor (ako ti odgovara taj nacin ovde imas jos nekih dodatnih informacija, ako ti uopste trebaju https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label , https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break), ali postoji jos par fora, npr sa return, a mozes i ako si u for petlji da podesis onaj var i na vrednost koja ce ga naterati da iskoci iz petlje i tako imas slicnih fora
     */
    parentloop:
    for(const prop in changedUserFormData){
     /* if(prop === 'profileImage'){
        console.log('eve slike!', typeof changedUserFormData[prop]);//Ako je null, ispisace object!!!
      }*/

      // Ispitivanje za sliku mora ici u zaseban blok koda, jer je njoj pocetna vrednost null, a null je ocigledno tipa object pa mora ici pre prvog else if-a, a nad nullom se ne moze ni izvrsiti trim() ko sto radim u drugom else if
      if(prop === 'profileImage'){
        if(changedUserFormData[prop] === null){
          allFieldsChanged = false
          console.log('Nepromenjena pocetna vrednost slike!');
          break
        }
      }
      // Moram na pocetku da proveravam ove nested objekte iz razloga zato sto ovi objekti iako imaju potpuno iste vrednosti opet ako ih uporedis javascript ce ti vratiti false (moras im proveravati propertije jedan po jedan ako hoces da ih uporedis). Tako da ne smem da pustim da mi se u sadasnjem else if delu koda proveravaju bilo kakkvi objekti (jer bi ti dva potpuno jednaka objekta (sa potpuno jednakim vrednostima) on protumacio kao nejednake i uslov bi prosao). Time sto kao prvi else if navodim proveru za objekte, u drugom else if delu koda se ne mogu naci objekti i time je to reseno
      else if(typeof changedUserFormData[prop] === 'object'){
        for(const nestedProp in changedUserFormData[prop]){
          if(changedUserFormData[prop][nestedProp] === this.unchangedUserFormData[prop][nestedProp]){
            console.log('Nepromenjena pocetna vrednost nekog od polja unutar nested form grupe (passworda ili confirm passworda)');
            allFieldsChanged = false
            break parentloop
          }
        }
      }else if(changedUserFormData[prop].trim() === this.unchangedUserFormData[prop].trim()) {
        allFieldsChanged = false
        console.log('Nepromenjena pocetna vrednost nekog od polja koja nisu unutar zasebne nested form grupe (osim slike, dakle: imena, prezimena ili maila), a to jeeeee', prop);
        break
      }else{
        // allFieldsChanged = true
        console.log('Promenjeno polje: ', prop);
      }

    }


    /*Heh, ovo se inace ovako ne radi (da ti u body requesta stavljas koja je http metoda u pitanju) nego koristis angularove HttpClient metode put, patch, post i sl. ALI u ovom konkretnom slucaju ovo se mora ovako uraditi, jer laravel (cak mozda i php uopste) ne prima podatke tipa FormData preko put ili patch requesta! Workaroundova ima par kolko vidim po netu, ali ovde je npr taj da ne koristis FormData podatke uopste, nego da stavljas sve unutar onog body objekta unutar angularovih http metoda, a ako hoces da koristis FormData e onda treba da uradis ovo, tj. da stavis ovaj _method property unutar FormData i da mu zadas ime metode, a koristis angularovu http post metodu! Server tj laravel u ovom slucaju ce prepoznati da se radi o onom requestu, kojeg si ti naveo kao vrednost od _method unutar FormData objekta. Linkovi sa ovim workaroundom koji ti koristis i sa jos nekima:
    https://github.com/laravel/framework/issues/13457
    https://laravel.io/forum/02-13-2014-i-can-not-get-inputs-from-a-putpatch-request
    https://stackoverflow.com/questions/50691938/patch-and-put-request-does-not-working-with-form-data
    https://stackoverflow.com/questions/44689311/angular2-http-put-method-not-sending-formdata - vidi odgovor od levis

    */
    // Inace ovo mi je ovde i zgodno cak zato sto lako mogu da odaberem hocu li da koristim PUT ili PATCH request. Da ovoga nema morao bi da u if else bloku da pisem dve odvojene angularove http metode
    if(allFieldsChanged === true){
      console.log('Put metoda ce se koristiti!');
      sendData.append('_method', 'PUT')
    }else{
      console.log('Patch metoda ce se koristiti!');
      sendData.append('_method', 'PATCH')
    }

    // Ukoliko je needPasswordReEnter === true, sto znaci da se menja neki od osetljivih podataka a to su svi osim slike, radi se ponovni unos sifre iz sigurnosnih razloga, a u else delu koda hendlujes podatke koji nisu osetljivi a to je jedino slika. Dakle jedino u slucaju kad uploadujes samo sliku tad nema potrebe da ponovo unosis sifru
    if(needPasswordReEnter === true){
      // Moram ga zalepiti za this.sendData, jer cu ga ponovo koristiti u drugoj funkciji
      this.sendData = sendData
      // Msm da je ovo najjednostavniji nacin da se otvori bootstrap modal u angularu (vidi https://stackoverflow.com/questions/35400811/how-to-use-code-to-open-a-modal-in-angular-2)
      this.passwordModalButtonTrigger.nativeElement.click()

      /**************************************************************/
      /*Kod koji onemogucava da se unese sifra zapamcena od strane browsera (u trenutnoj verziji Chrome-a radi, u Mozilli radi samo kad ti ponudi da uneses zapamcenu sifru pa ti kliknes, ali nekad ti se samo unese u polje i tad ne radi. Jedan od mogucih razloga zasto je to tako je mozda taj sto razliciti browseri emituju razlicite eventove kad se desi autofill input polja, vidi https://stackoverflow.com/questions/11708092/detecting-browser-autofill. TAKO DA OVO NIJE CROSS BROWSER RESENJE, NE RADI SVUGDE POSAO, A NISAM NI SVE BROWSERE TESTIRAO), odnosno onemogucava da se u password input odjednom unese vise vrednosti, nego mora jedna po jedna.

      Filozofija je ta da ono sto uneses u password polje nikad ne moze biti za dva (i vise) znakova duze od prethodne vrednosti, nego moze samo za jedan, jer tako i user unosi sifru, znak po znak, odnosno prilikom svakog unosa ukupan zbir unetih znakova biva uvecan za 1 i ovde upravo kazem da se moze uvecati samo za 1 a ne za dva ili vise. Ako se unese za dva ili vise to znaci il da pasteujes sifru il da je browser automatski unosi a ovaj kod to zabranjuje. Mada jbg kao sto vidis npr Mozilla ipak uspeva nekako da unese sifru, ne znam bas kako al jbg
      */

      /*<<<ODKOMENTARISATI OVDE DA TI PRORADI - KOD KOJI ONEMOGUCAVA DA SE UNESE SIFRA ZAPAMCENA OD STRANE BROWSERA
      // Uporedjujem dve vrednosti, trenutnu koja mi trenutno stoji u input polju i prethodnu
      let reEnteredPasswordPreviousValue: string = ''
      let reEnteredPasswordCurrentValue: string = ''
      // Subscribeujem se na promene u formi
      this.reEnteredPasswordFormSubscription = this.reEnteredPasswordForm.valueChanges.subscribe((data) => {

        reEnteredPasswordCurrentValue = data.reEnteredPassword

        console.log('current value length before any change', reEnteredPasswordCurrentValue.length);
        console.log('previous value length before any change', reEnteredPasswordPreviousValue.length);

        // Ako trenutna je duzina trenutne vrednosti veca od duzine prethodne za dva karaktera ili vise to znaci da user ne unosi sifru karakter po karakter, vec unosi vise karaktera ODJEDNOM, ja to ne dozvoljavam i u tom slucaju ponistavam vrednost input polja na prazan string
        if(reEnteredPasswordCurrentValue.length > reEnteredPasswordPreviousValue.length + 1){
          this.reEnteredPasswordForm.setValue({reEnteredPassword: ''})
        }else{
          // Stavljanjem ovoga u else onemogucavam da previous value ikada dobije ovu prekoracenu nedozvoljenu vrednost (mada se to ne desava i bez stavljanja u else, ali jebem li ga, za svaki slucaj ipak nek stoji u elsu). Dakle trenutna vrednost se dodeljuje prethodnoj vrednosti, da bi pri narednom unosu trenutna vrednost predstavljala prethodnu
          console.log('Trenutna vrednost se dodeljuje prethodnoj vrednosti, da bi pri narednom unosu trenutna vrednost predstavljala prethodnu:');
          reEnteredPasswordPreviousValue = reEnteredPasswordCurrentValue
        }

        console.log('current value length after any change', reEnteredPasswordCurrentValue.length);
        console.log('previous value length after any change', reEnteredPasswordPreviousValue.length);

      })
      */
      /**************************************************************/

    }else{
      this.showLoaderDisablePageElements(true)
      this.authService.updateUserData(sendData).subscribe(() => {
        console.log('Uploadovana samo slika!');
        this.showLoaderDisablePageElements(false)

        /*Pomocu ovoga postizem da ne moram rucno da updateujem formu nakon promene podataka, vec jednostavno reloadujem celu my-account komponentu. To se postize na ovaj nacin koji je verovatno malo hacky, ali radi, jer kolko sam video ne postoji neki regularan nacin da se ovo uradi. Ti ovde samo ides na adresu jedne prazne komponente koju si napravio, pa se vracas na pocetnu adresu i to prouzrokuje da se pocetna komponenta reloaduje. Ovu foru sam pokupio ovde https://stackoverflow.com/questions/47813927/how-to-refresh-a-component-in-angular (odgovor od Sreehari Ballampalli) i mislim da je ovo prilicno dobra fora zato sto koristi i ovaj skipLocationChange pomocu kojeg ti se ova prazna komponenta uopste ne upisuje u history browsera i ne remeti back funkciju (https://angular.io/api/router/NavigationExtras#skipLocationChange). Postoje jos neki nacini kolko vidim (IZGLEDA DA ZA ANGULAR > 5 POSTOJI NACIN KOJI NIJE HACK, VIDI https://medium.com/engineering-on-the-incline/reloading-current-route-on-click-angular-5-1a1bfc740ab2), ali ovo mi za sad lepo radi i cini mi se da je najbolji nacin, evo jos nekih linkova korisnih:
        
        - https://github.com/angular/angular/issues/13831
        - https://stackoverflow.com/questions/38836674/how-do-i-re-render-a-component-manually
        - https://medium.com/engineering-on-the-incline/reloading-current-route-on-click-angular-5-1a1bfc740ab2
        - itd

        */
        this.router.navigateByUrl('/reload-component', {skipLocationChange: true}).then(() => this.router.navigate(["/my-account"])).then(() => alert('You have successfully updated your data!'));
      }, (err: HttpErrorResponse) => {
        if(err.error.errors){
          this.showLoaderDisablePageElements(false)
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

  // Ova metoda salje odvojeno sensitive i nonsensitive podatke. Moze se koristiti sa obe funkcije koje navodis kao submit handlere na bootstrap modal formi (updateAccountDataWithReEnteredPassword i updateAccountDataWithReEnteredPasswordAndMailConfirmation). Preporucujem je pre nego updateAccountData funkciju
  public updateAccountData2(){

    let sensitiveSendData = new FormData()
    // Ovde ne appendujem jos _method properti, jer zelim da ova updateAccountData2() metoda moze da se iskoristi u oba slucaja, i kad trazis mail confirmation (post metoda) i kad ga ne trazis (patch metoda)
    let sensitiveDataChanged = false
    let nonSensitiveSendData = new FormData()
    nonSensitiveSendData.append('_method', 'PATCH')//Uvek ce biti patch jer saljem uvek saljem samo deo podataka usera, a put ide jedino kad odjednom menjas kompletnog usera tj kompletan record usera u bazi
    let nonSensitiveDataChanged = false
    let changedUserFormData = this.updateAccountDataForm.getRawValue()
    console.log(changedUserFormData);

    // Ova petlja sluzi za proveru da vidis da li se ista promenilo od pocetnih vrednosti forme i to ne iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl), i prilicno je REUSABLE (recimo)
    for(const prop in changedUserFormData){
      // Moram na pocetku da proveravam ove nested objekte iz razloga zato sto ovi objekti iako imaju potpuno iste vrednosti opet ako ih uporedis javascript ce ti vratiti false (moras im proveravati propertije jedan po jedan ako hoces da ih uporedis). Tako da ne smem da pustim da mi se u sadasnjem else if delu (else if delovima kako god) koda proveravaju bilo kakkvi objekti (jer bi ti dva potpuno jednaka objekta (sa potpuno jednakim vrednostima) on protumacio kao nejednake i uslov bi prosao). Time sto kao prvi if navodim proveru za objekte, u else if delu koda se ne mogu naci objekti i time je to reseno
      if(typeof changedUserFormData[prop] === 'object'){
        for(const nestedProp in changedUserFormData[prop]){
          // Ovaj uslov zapravo detektuje promenu u formi u odnosu na ono kakva je bila na samom pocetku, i to ne promenu iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl)
          if(changedUserFormData[prop][nestedProp] && (changedUserFormData[prop][nestedProp] !== this.unchangedUserFormData[prop][nestedProp])){
            sensitiveDataChanged = true
            if(nestedProp === 'confirmPassword'){
              // Moram ga ovde promenuti iz confirmPassword u password_confirmation, jer Laravel za konfirmaciju sifre trazi da potvrdjena sifra ima key password_confirmation
              sensitiveSendData.append('password_confirmation', changedUserFormData[prop][nestedProp])
            }else{
              sensitiveSendData.append(nestedProp, changedUserFormData[prop][nestedProp])
            }
            console.log(nestedProp, changedUserFormData[prop][nestedProp]);
          }

        }
      }
      // Ispitivanje za sliku mora ici u zaseban blok koda, jer je njoj pocetna vrednost null, a nad nullom se ne moze izvrsiti trim() ko sto radim u narednom else if
      else if(prop === 'profileImage'){
        if(changedUserFormData[prop] !== null){

          nonSensitiveDataChanged = true
          // Ne stavljam changedUserFormData[prop] u nonSensitiveSendData, nego this.croppedImage jer mi se tu nalazi base64 string koji je zapravo ta slika i to treba da se posalje na server
          nonSensitiveSendData.append('profile_image', this.croppedImage)
          console.log(prop, this.croppedImage);
          
        }
      }
      // Ovaj uslov zapravo detektuje promenu u formi u odnosu na ono kakva je bila na samom pocetku, i to ne promenu iz neceg u nista (npr iz postojeceg maila u prazan string), nego iz neceg u nesto drugo (mail u neki drugi mail i sl)
      else if(changedUserFormData[prop].trim() && (changedUserFormData[prop].trim() !== this.unchangedUserFormData[prop].trim())) {
        sensitiveDataChanged = true
        if(prop === 'firstName'){
          sensitiveSendData.append('first_name', changedUserFormData[prop].trim())
        }else if(prop === 'lastName'){
          sensitiveSendData.append('last_name', changedUserFormData[prop].trim())
        }else{
          sensitiveSendData.append(prop, changedUserFormData[prop].trim())
        }
        console.log(prop, changedUserFormData[prop].trim());
      }else{
        // console.log('Upade u else!');
      }

    }


    if(nonSensitiveDataChanged){
      
      this.disableProgressBar++
      this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'visible')

      this.authService.updateUserData(nonSensitiveSendData).subscribe((loggedUser: any) => {
        console.log('Uploadovani non sensitive podaci, tj slika :)!');
        alert('You have successfully updated your profile image!')

        this.clearImage()
        this.loggedUserExsistingProfileImage = loggedUser.profile_image
        this.disableProgressBar--
        this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'hidden')
      }, (err: HttpErrorResponse) => {
        if(err.error.errors){
          this.disableProgressBar--
          this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'hidden')
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

    if(sensitiveDataChanged){
      // Moram ga zalepiti za this.sendData, jer cu ga ponovo koristiti u drugoj funkciji
      this.sendData = sensitiveSendData
      // Msm da je ovo najjednostavniji nacin da se otvori bootstrap modal u angularu (vidi https://stackoverflow.com/questions/35400811/how-to-use-code-to-open-a-modal-in-angular-2)
      this.passwordModalButtonTrigger.nativeElement.click()
    }



  }


  //Ova funkcija se okida kad submitujes formu za ponovno unosenje sifre
  public updateAccountDataWithReEnteredPassword(reEnteredPassword: string){
    if(reEnteredPassword){

      if(!this.sendData.has('_method')){
        this.sendData.append('_method', 'PATCH')
      }
      
      if(this.sendData.has('reentered_password')){
        /*The difference between FormData.set and append() is that if the specified key already exists, FormData.set will overwrite all existing values with the new one, whereas append() will append the new value onto the end of the existing set of values.(https://developer.mozilla.org/en-US/docs/Web/API/FormData/append)*/
        this.sendData.set('reentered_password', reEnteredPassword)
      }else{
        this.sendData.append('reentered_password', reEnteredPassword)
      }
      
      this.disableProgressBar++
      this.disableModalElements(true)
      this.reEnteredPasswordForm.setValue({reEnteredPassword: ''})
      this.authService.updateUserData(this.sendData).subscribe(() => {
        // Kako radis unsubscribe() https://stackoverflow.com/questions/43840955/angular-2-formgroup-valuechanges-unsubscribe
        /*
        //KOD KOJI ONEMOGUCAVA DA SE UNESE SIFRA ZAPAMCENA OD STRANE BROWSERA
        this.reEnteredPasswordFormSubscription.unsubscribe()*/
        this.passwordModalButtonTrigger.nativeElement.click()//Zatvaram bootstrap modal
        this.disableProgressBar--
        this.disableModalElements(false)
        
        /*Pomocu ovoga postizem da ne moram rucno da updateujem formu nakon promene podataka, vec jednostavno reloadujem celu my-account komponentu. To se postize na ovaj nacin koji je verovatno malo hacky, ali radi, jer kolko sam video ne postoji neki regularan nacin da se ovo uradi. Ti ovde samo ides na adresu jedne prazne komponente koju si napravio, pa se vracas na pocetnu adresu i to prouzrokuje da se pocetna komponenta reloaduje. Ovu foru sam pokupio ovde https://stackoverflow.com/questions/47813927/how-to-refresh-a-component-in-angular (odgovor od Sreehari Ballampalli) i mislim da je ovo prilicno dobra fora zato sto koristi i ovaj skipLocationChange pomocu kojeg ti se ova prazna komponenta uopste ne upisuje u history browsera i ne remeti back funkciju (https://angular.io/api/router/NavigationExtras#skipLocationChange). Postoje jos neki nacini kolko vidim (IZGLEDA DA ZA ANGULAR > 5 POSTOJI NACIN KOJI NIJE HACK, VIDI https://medium.com/engineering-on-the-incline/reloading-current-route-on-click-angular-5-1a1bfc740ab2), ali ovo mi za sad lepo radi i cini mi se da je najbolji nacin, evo jos nekih linkova korisnih:
        
        - https://github.com/angular/angular/issues/13831
        - https://stackoverflow.com/questions/38836674/how-do-i-re-render-a-component-manually
        - https://medium.com/engineering-on-the-incline/reloading-current-route-on-click-angular-5-1a1bfc740ab2
        - itd

        */
        this.router.navigateByUrl('/reload-component', {skipLocationChange: true}).then(() => this.router.navigate(["/my-account"])).then(() => alert('You have successfully updated your data!'));
      }, (err: HttpErrorResponse) => {
        this.disableProgressBar--
        this.disableModalElements(false)
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

  //Ova funkcija se okida kad submitujes formu za ponovno unosenje sifre
  public updateAccountDataWithReEnteredPasswordAndMailConfirmation(reEnteredPassword: string){
    if(reEnteredPassword){
      
      if(this.sendData.has('reentered_password')){
        /*The difference between FormData.set and append() is that if the specified key already exists, FormData.set will overwrite all existing values with the new one, whereas append() will append the new value onto the end of the existing set of values.(https://developer.mozilla.org/en-US/docs/Web/API/FormData/append)*/
        this.sendData.set('reentered_password', reEnteredPassword)
      }else{
        this.sendData.append('reentered_password', reEnteredPassword)
      }
      
      this.disableProgressBar++
      this.disableModalElements(true)
      this.reEnteredPasswordForm.setValue({reEnteredPassword: ''})
      this.authService.updateUserDataWithMailConfirmation(this.sendData).subscribe(() => {
        // Kako radis unsubscribe() https://stackoverflow.com/questions/43840955/angular-2-formgroup-valuechanges-unsubscribe
        /*
        //KOD KOJI ONEMOGUCAVA DA SE UNESE SIFRA ZAPAMCENA OD STRANE BROWSERA
        this.reEnteredPasswordFormSubscription.unsubscribe()*/
        this.passwordModalButtonTrigger.nativeElement.click()//Zatvaram bootstrap modal
        this.disableProgressBar--
        this.disableModalElements(false)
        
        this.router.navigateByUrl('my-account/verification-message');//url guard podesavam u auth servisu, jer ne mogu ovde
      }, (err: HttpErrorResponse) => {
        this.disableProgressBar--
        this.disableModalElements(false)
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

  public resetReEnteredPasswordForm(){
    this.reEnteredPasswordForm.setValue({reEnteredPassword: ''})
    // Kako radis unsubscribe() https://stackoverflow.com/questions/43840955/angular-2-formgroup-valuechanges-unsubscribe
    /*
    //KOD KOJI ONEMOGUCAVA DA SE UNESE SIFRA ZAPAMCENA OD STRANE BROWSERA
    this.reEnteredPasswordFormSubscription.unsubscribe()*/
  }

  public showLoaderDisablePageElements(show: boolean){
    if(show === true){
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')
      this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'visible')
    }else{
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
      this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'hidden')
    }
  }

  public disableModalElements(disable: boolean){
    if(disable === true){
      this.renderer.setProperty(this.modalCloseButton.nativeElement, 'disabled', true)
      this.renderer.setProperty(this.modalCancelButton.nativeElement, 'disabled', true)
    }else{
      this.renderer.setProperty(this.modalCloseButton.nativeElement, 'disabled', false)
      this.renderer.setProperty(this.modalCancelButton.nativeElement, 'disabled', false)
    }
  }


}
