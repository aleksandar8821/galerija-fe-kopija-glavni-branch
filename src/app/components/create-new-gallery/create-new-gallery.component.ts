import { Component, OnInit, QueryList, ViewChildren, ViewChild, ViewContainerRef, ComponentRef, ElementRef, Renderer2 } from '@angular/core';
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

  @ViewChildren(AddImageComponent) addImageComponents: QueryList<AddImageComponent> //msm da se na ovaj nacin ne mogu videti dinamicki kreirane komponente. Ovo sad pisem kasnije i kolko se secam komponente mi nisu bile dostupne na ovaj nacin. Vidi https://stackoverflow.com/questions/43102427/viewchildren-not-finding-dynamic-components 
  @ViewChild("addImageViewContainerRef", {read: ViewContainerRef}) addImageViewContainerRef: ViewContainerRef;
  @ViewChild("progressBar") progressBar: ElementRef
  @ViewChild("btnAddImage") btnAddImage: ElementRef
  @ViewChild("btnCreateGallery") btnCreateGallery: ElementRef

  public addImageComponentCounter: Array<any> = []
	public gallery: Gallery = new Gallery();
	public image: Image = new Image()
  public selectedImage: any
  public files : FileList;
  public componentImages: Array<any> = [] 
  public url: any
  public uploadImageError: string
  public addImageDiv: any
  
    
  constructor(private http: HttpClient, private authService: AuthService, private domService: DomService, private router: Router, private renderer: Renderer2) { }

  ngOnInit() {
    this.domService.setViewContainerRef(this.addImageViewContainerRef)
    // Nakon uspesnog kreiranja i redirekcije na pocetnu stranicu, kad bi se vratio na create new gallery stranicu, ostajale bi mi upamcene prethodno kreirane komponente, pa ih pri inicijalizaciji stranice odmah brisem ovako
    if(this.domService.createdComponentsArray.length >= 1){
      this.domService.createdComponentsArray.forEach((componentRef: ComponentRef<any>) => {
        componentRef.destroy()
      })
    }
    this.domService.createdComponentsArray = []
    this.addAnotherImage() //odmah u startu dodajem jedan element za dodavanje slika
  }

  //ovo je metoda za verziju gde je mogla da se doda samo jedna slika u galeriju, pa reko ajd da ostane ovde iako ne sluzi sada nicemu. createGallery2() dole dodaje vise slika u galeriju iz vise dinamicki kreiranih komponenti
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

  // Ova metoda dodaje vise slika u galeriju iz vise dinamicki kreiranih komponenti:
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
          formData.append("selectedImagesVerticalInfo[]", addedImage.vertical)
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
            this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
            this.renderer.setProperty(this.btnAddImage.nativeElement, 'disabled', false)
            this.renderer.setProperty(this.btnCreateGallery.nativeElement, 'disabled', false)
            alert(errorString);
          });

    }, () => {
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
      this.renderer.setProperty(this.btnAddImage.nativeElement, 'disabled', false)
      this.renderer.setProperty(this.btnCreateGallery.nativeElement, 'disabled', false)
    })

    // msm da bi ovo ipak trebalo da ti stoji gore u success handleru od subscribe-a
    // this.http.post('http://127.0.0.1:8000/api/galleries_multiple_images', formData, {
    //     headers: this.authService.getRequestHeaders()
    //   }).subscribe((data) => {
    //   console.log(data)
    // }, (error) => {
    //   console.log(error)
    // });

    this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')
    this.renderer.setProperty(this.btnAddImage.nativeElement, 'disabled', true)
    this.renderer.setProperty(this.btnCreateGallery.nativeElement, 'disabled', true)
  }

  public addAnotherImage(){
    this.domService.addDynamicComponent(AddImageComponent)
    // console.log(this.addImageViewContainerRef);
  }

}
