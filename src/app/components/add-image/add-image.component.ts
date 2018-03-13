import { Component, OnInit, EventEmitter, Input, Output, ComponentRef } from '@angular/core';
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

	  // public image: Image = new Image()
	  public imageDescription: string
	  public selectedImage: any
	  public files : FileList; 
	  public url: any
	  public uploadImageError: string
	  public newImagesDiv: any
    // public isVertical: boolean = false
    // kasnije cu i tako morati da pretvaram isVertical u broj 0 ili 1 da bi ih uneo u bazu, tako da cu ga odmah tako definisati
    public isVertical: number = 0
	  
	  getFiles(event){
    console.log('juhuuuuuuuuuuuu'); 
	      this.files = event.target.files;
        // console.log(event.target);
	      this.selectedImage = event.target.files[0]
	      this.uploadImageError = null
	      // Na ovaj nacin prikazujem thumbnail nakon uploada fajla (prekopirano odavde: https://stackoverflow.com/questions/39074806/how-to-preview-picture-stored-in-the-fake-path-in-angular-2-typescript   isto imas i ovde: https://stackoverflow.com/questions/4459379/preview-an-image-before-it-is-uploaded?rq=1)
	      if (event.target.files && event.target.files[0]) {
	        if(!event.target.files[0].type.startsWith('image/')){
            this.selectedImage = null
	          event.target.value = null //ovo je inace nacin da se iz input type file izbrise fajl koji je odabran. evo jos par nacina (slicnih, gotovo istih): https://stackoverflow.com/questions/41759704/how-to-clear-files-from-input-type-file-using-jquery-or-javascript , https://www.sitepoint.com/community/t/clear-input-type-file/257508/2 , https://nehalist.io/uploading-files-in-angular2/ <<< gledaj metodu clearFile() , https://stackoverflow.com/questions/40165271/how-to-reset-selected-file-with-input-tag-file-type-in-angular-2
	          this.url = null


            // errorDiv.style.animation = "flash-message 4s forwards"
	          this.uploadImageError = "File must be an image!"
            let errorDiv = document.querySelector('.myclass-upload-image-error') as any
            console.log(errorDiv);
	          return false //ovde moram izaci iz cele funkcije, da ne bi isao dalje, jer onda naravno izbacuje neke greske, jer sam prethodno izbrisao fajl iz input type file
	        }

	        var reader = new FileReader();

	        reader.onload = (event:any) => {
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

  constructor(private domService: DomService) { }

  ngOnInit() {
  	this.newImagesDiv = document.getElementById('newImagesDiv')
  }


  public resizeImageIfVertical($event){
    // console.log($event);
    // kako dobaviti dimenzije slike https://davidwalsh.name/get-image-dimensions
    if (($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.5) {
      $event.path[0].style.width = '40%'
      // this.isVertical = true
      this.isVertical = 1
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



  public moveUp(e){
  	e.preventDefault()
  	// console.log(e.target.parentNode.parentNode.parentNode.parentNode.parentNode)
  	// console.log(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.previousElementSibling)
  	let clickedComponent = e.target.parentNode.parentNode.parentNode.parentNode.parentNode
  	let previousComponent = clickedComponent.previousElementSibling
  	this.newImagesDiv.insertBefore(clickedComponent, previousComponent)
  	// console.log(this.newImagesDiv);
  	
  }

  public move(shift: number, e){
  	e.preventDefault() //da se link ne aktivira
  	this.domService.move(shift, this.componentReference)
  }

  public destroySelf(){
  	this.domService.destroyComponent(this.componentReference)
  }

}
