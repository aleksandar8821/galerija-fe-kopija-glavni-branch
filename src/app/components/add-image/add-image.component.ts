import { Component, OnInit, EventEmitter, Input, Output, ComponentRef, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Image } from '../../shared/models/image';
import { DomService } from '../../shared/services/dom.service';

@Component({
  selector: 'app-add-image',
  templateUrl: './add-image.component.html',
  styleUrls: ['./add-image.component.css']
})
export class AddImageComponent implements OnInit{

		
		@Output() imageData: EventEmitter<any> = new EventEmitter()
		@Input() componentReference: ComponentRef<any>
    @ViewChild('uploadImageErrorDiv') uploadImageErrorDiv: ElementRef

	  // public image: Image = new Image()
	  public imageDescription: string
	  public selectedImage: any
	  public files : FileList; 
	  public url: any
	  public uploadImageError: string
    // public isVertical: boolean = false
    // kasnije cu i tako morati da pretvaram isVertical u broj 0 ili 1 da bi ih uneo u bazu, tako da cu ga odmah tako definisati
    public isVertical: number = 0
    public heightWidthRatio: number
    public removeUploadImageErrorTimeout: any
    public uploadImageLoader: boolean = false
	  
	  getFiles(event){
    console.log('juhuuuuuuuuuuuu'); 
	      this.files = event.target.files;
        // console.log(event.target);
	      this.selectedImage = event.target.files[0]
	      this.uploadImageError = null
        if (event.target.files && event.target.files[0]) {
          if(!event.target.files[0].type.startsWith('image/')){
            this.selectedImage = null
            event.target.value = null //ovo je inace nacin da se iz input type file izbrise fajl koji je odabran. evo jos par nacina (slicnih, gotovo istih): https://stackoverflow.com/questions/41759704/how-to-clear-files-from-input-type-file-using-jquery-or-javascript , https://www.sitepoint.com/community/t/clear-input-type-file/257508/2 , https://nehalist.io/uploading-files-in-angular2/ <<< gledaj metodu clearFile() , https://stackoverflow.com/questions/40165271/how-to-reset-selected-file-with-input-tag-file-type-in-angular-2
            this.url = null

            //Ovo je kod koji omogucava da se jednom izvrsena css animacija nad elementom ponovo izvrsi, bez ovoga kad bi animacija odradila jednom svoje, vise ne bi mogao ponovo da je pokrenes, tj restartujes. Ima o ovome na netu samo trazi restart css animation(super link npr https://css-tricks.com/restart-css-animation/). Inace ovaj kod je nadjen na ovom linku https://stackoverflow.com/questions/6268508/restart-animation-in-css3-any-better-way-than-removing-the-element, u odgovoru od usera po imenu user.
            this.renderer.setStyle(this.uploadImageErrorDiv.nativeElement, 'animation', 'none')
            this.uploadImageErrorDiv.nativeElement.offsetHeight /* s ovom linijom koda triggerujes taj neki reflow, ovde imas sve te neke stvari koje trigeruju taj reflow https://gist.github.com/paulirish/5d52fb081b3570c81e3a */
            this.renderer.setStyle(this.uploadImageErrorDiv.nativeElement, 'animation', null)

            clearTimeout(this.removeUploadImageErrorTimeout) // problem je kad vise puta zaredom trigerujes ovu gresku stari setTimeout koji je aktiviran ostaje aktivan i sklonice gresku pre vremena, zato radim clearTimeout
            this.uploadImageError = "File must be an image!"
            this.removeUploadImageErrorTimeout = setTimeout(() => {this.uploadImageError = null}, 8500) //ovo ubacujem zato sto u css animacijama ne mogu da koristim display property, pa kad podesim uploadImageError = null, angular hidden direktiva ce ga podesiti na display: none

            return false //ovde moram izaci iz cele funkcije, da ne bi isao dalje, jer onda naravno izbacuje neke greske, jer sam prethodno izbrisao fajl iz input type file
          }

          this.uploadImageLoader = true

	      // Na ovaj nacin prikazujem thumbnail nakon uploada fajla (prekopirano odavde: https://stackoverflow.com/questions/39074806/how-to-preview-picture-stored-in-the-fake-path-in-angular-2-typescript   isto imas i ovde: https://stackoverflow.com/questions/4459379/preview-an-image-before-it-is-uploaded?rq=1)
          var reader = new FileReader();

	        reader.onload = (event:any) => {
            this.uploadImageLoader = false
	          this.url = event.target.result;
	          // console.log(event.target)
	        }

	        reader.readAsDataURL(event.target.files[0]);

	        // let dataPackage = {
	        // 	componentRef: this.componentReference,
	        // 	image: this.selectedImage,
	        // 	description: this.imageDescription
	        // }

	        // this.imageData.emit(dataPackage)
	      }else{
	        this.url = null
	      }     
	  } 

  constructor(private domService: DomService, private renderer: Renderer2) { }

  ngOnInit() { }


  public resizeImageIfVertical($event){
    // console.log($event);
    // kako dobaviti dimenzije slike https://davidwalsh.name/get-image-dimensions
    this.heightWidthRatio = $event.path[0].naturalHeight / $event.path[0].naturalWidth

    if (this.heightWidthRatio >= 1.5) {
      $event.path[0].style.width = '40%'
      // this.isVertical = true
      this.isVertical = 1
    }else if(this.heightWidthRatio >= 1.2){
      $event.path[0].style.width = '50%'
      this.isVertical = 1
    }else{
      $event.path[0].style.width = '80%'
      this.isVertical = 0
    }
  }

 

  // ngOnChanges se nazalost ne poziva kad se inputi menjaju u dinamciki kreiranoj komponenti, pa pravim proizvoljnu funkciju koju cu zvati manualno preko servisa (https://stackoverflow.com/questions/43112685/change-detection-not-working-when-creating-a-component-via-componentfactoryresol -> vidi komentar od Günter Zöchbauer)
  public sendImageData(){
  	// Saljem jedino ako je selektovana slika da se ne moze desiti da se unese description, a bez slike i da se to unese u bazu
  	if(this.selectedImage){
  		let dataPackage = {
  			componentRef: this.componentReference,
  			image: this.selectedImage,
  			description: this.imageDescription,
        vertical: this.isVertical
  		}
  		this.imageData.emit(dataPackage)
  	}
 	
  }


  public move(shift: number, e){
  	e.preventDefault() //da se link ne aktivira
  	this.domService.move(shift, this.componentReference)
  }

  public destroySelf(){
  	this.domService.destroyComponent(this.componentReference)
  }

}
