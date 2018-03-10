import { Component, OnInit, QueryList, ViewChildren, ViewChild, ViewContainerRef } from '@angular/core';
import { AddImageComponent } from '../add-image/add-image.component';
import { Gallery } from '../../shared/models/gallery';
import { Image } from '../../shared/models/image';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { SanitizeHtmlPipe } from '../../shared/pipes/sanitize-html.pipe';
import { DomService } from '../../shared/services/dom.service'

@Component({
  selector: 'app-create-new-gallery',
  templateUrl: './create-new-gallery.component.html',
  styleUrls: ['./create-new-gallery.component.css']
})
export class CreateNewGalleryComponent implements OnInit {

  @ViewChildren(AddImageComponent) addImageComponents: QueryList<AddImageComponent>
  @ViewChild("addImageViewContainerRef", {read: ViewContainerRef}) addImageViewContainerRef: ViewContainerRef;
  public addImageComponentCounter: Array<any> = []
	public gallery: Gallery = new Gallery();
	public image: Image = new Image()
  public selectedImage: any
  public files : FileList;
  public componentImages: Array<any> = [] 
  public url: any
  public uploadImageError: string
  public newImagesDiv: any
  public addImageDiv: any
  
  getFiles(event){ 
      this.files = event.target.files;
      // console.log(event.target.files[0]);
      this.selectedImage = event.target.files[0]
      this.uploadImageError = null
      // Na ovaj nacin prikazujem thumbnail nakon uploada fajla (prekopirano odavde: https://stackoverflow.com/questions/39074806/how-to-preview-picture-stored-in-the-fake-path-in-angular-2-typescript   isto imas i ovde: https://stackoverflow.com/questions/4459379/preview-an-image-before-it-is-uploaded?rq=1)
      if (event.target.files && event.target.files[0]) {
        if(!event.target.files[0].type.startsWith('image/')){
          event.target.value = null //ovo je inace nacin da se iz input type file izbrise fajl koji je odabran. evo jos par nacina (slicnih, gotovo istih): https://stackoverflow.com/questions/41759704/how-to-clear-files-from-input-type-file-using-jquery-or-javascript , https://www.sitepoint.com/community/t/clear-input-type-file/257508/2 , https://nehalist.io/uploading-files-in-angular2/ <<< gledaj metodu clearFile() , https://stackoverflow.com/questions/40165271/how-to-reset-selected-file-with-input-tag-file-type-in-angular-2
          this.url = null
          this.uploadImageError = "File must be an image!"
          return false //ovde moram izaci iz cele funkcije, da ne bi isao dalje, jer onda naravno izbacuje neke greske, jer sam prethodno izbrisao fajl iz input type file
        }

        var reader = new FileReader();

        reader.onload = (event:any) => {
          this.url = event.target.result;
          // console.log(event.target)
        }

        reader.readAsDataURL(event.target.files[0]);
      }else{
        this.url = null
      }     
  } 

  logForm(event) { 
       console.log(this.files); 
  } 
  
  constructor(private http: HttpClient, private authService: AuthService, private domService: DomService, private router: Router) { }

  ngOnInit() {
    this.newImagesDiv = document.getElementById('newImagesDiv')
    this.domService.setViewContainerRef(this.addImageViewContainerRef)
    this.addAnotherImage()
  }


  public createGallery(gallery, image){
  	console.log(gallery)
  	let formData = new FormData();
    formData.append('name', gallery.name)
    formData.append('descriptionGallery', gallery.description)
    formData.append('selectedImage', this.selectedImage, this.selectedImage.name);
    formData.append('descriptionImage', image.description);

    // FormData je neki blesavi tip podataka koji ne moze da se console.log-uje!!! (https://github.com/meteor/meteor/issues/8125)
    // console.log(formData)

    this.http.post('http://127.0.0.1:8000/api/galleries', formData, {
        headers: this.authService.getRequestHeaders()
      }).subscribe((data) => {
      console.log(data)
    }, (error) => {
      console.log(error)
    });
  }

  public createGallery2(gallery){

    let formData = new FormData();
    // FormData je neki blesavi tip podataka koji ne moze da se console.log-uje!!! (https://github.com/meteor/meteor/issues/8125)
    // console.log(formData)

    this.domService.getData().subscribe((addedImagesArray) => {console.log(addedImagesArray);
      console.log(gallery.description);
      if(gallery.description === ''){
        console.log('des bre');
      }
      // Nazalost, ovi dole uslovi se moraju postaviti, jer ovo undefined ce biti poslato na backend kao string 'undefined' i kao takvo ce biti upisano u bazu. Tako FormData() funkcionise. Objasnjenje(https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects): the field's value can be a Blob, File, or a string: if the value is neither a Blob nor a File, the value is converted to a string. Interesantno je medjutim da je vrednost inputa undefined jedino ako ga prethodno nisi cackao. Ako dakle nesto uneses u polje pa izbrises sve, onda mu vrednost nece biti undefined nego ce biti prazan string! A prazan string nije prolazio laravel validaciju za required, a baza je bar u mom slucaju upisivala NULL, tako da znas!
      if (gallery.name === undefined) {
        formData.append('name', '')
      }else{
        formData.append('name', gallery.name)
      }
      if (gallery.description === undefined) {
        formData.append('descriptionGallery', '')
      }else{
        formData.append('descriptionGallery', gallery.description)
      }
      
      // s ovim ifom dole sam zapravo resio validaciju na backendu da galerija mora imati minimum jednu sliku. Na backendu cu staviti da je selectedImagesFiles required, MADA sada vidim da ovo nije zapravo bilo ni potrebno, skontace laravel da je selectedImagesFiles prazan i uspece validacija i tako
      if(addedImagesArray.length > 0){
        addedImagesArray.forEach(addedImage => {
          formData.append("selectedImagesFiles[]", addedImage.image, addedImage.image.name)
          if (addedImage.description === undefined) {
            formData.append("selectedImagesDescriptions[]", '')
          }else{
            formData.append("selectedImagesDescriptions[]", addedImage.description)
          }
        })
      }

      this.http.post('http://127.0.0.1:8000/api/galleries_multiple_images', formData, {
              headers: this.authService.getRequestHeaders()
            }).subscribe((data) => {
            console.log(data)
            alert('You have successfully created a gallery!')
            this.router.navigateByUrl('/login');
          }, (err) => {
            console.log(err)
            //sa for in iteracijom, nisam uspeo da dobavim ove greske, ova funkcija Object.values() je pravo cudo!
            let errors = Object.values(err.error.errors) 
            let errorString: string = ''
            errors.forEach(function(message: string){
              if (message.includes("The selected images files field is required.") ) { 
                errorString += "You must add at least one image!" + '\n'
              } else {
                errorString += message + '\n'
              }
              
            });
            alert(errorString);
          });

    })

    // msm da bi ovo ipak trebalo da ti stoji gore u success handleru od subscribe-a
    // this.http.post('http://127.0.0.1:8000/api/galleries_multiple_images', formData, {
    //     headers: this.authService.getRequestHeaders()
    //   }).subscribe((data) => {
    //   console.log(data)
    // }, (error) => {
    //   console.log(error)
    // });
  }

  public addAnotherImage(){
    this.domService.appendComponentToAppendingElement(AddImageComponent, "#newImagesDiv")
    // console.log(this.addImageViewContainerRef);
  }


  public addComponentImageToArray($event){
    // this.componentImages.push($event)
    // console.log(this.componentImages);
    
    console.log(this.addImageComponents);
  }

}
