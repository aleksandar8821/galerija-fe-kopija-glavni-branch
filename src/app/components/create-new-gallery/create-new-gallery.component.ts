import { Component, OnInit } from '@angular/core';
import { Gallery } from '../../shared/models/gallery';
import { Image } from '../../shared/models/image';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { SanitizeHtmlPipe } from '../../shared/pipes/sanitize-html.pipe';

@Component({
  selector: 'app-create-new-gallery',
  templateUrl: './create-new-gallery.component.html',
  styleUrls: ['./create-new-gallery.component.css']
})
export class CreateNewGalleryComponent implements OnInit {

	public gallery: Gallery = new Gallery();
	public image: Image = new Image()
  public selectedImage: any
  public files : FileList; 
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
  
  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.newImagesDiv = document.getElementById('newImagesDiv')

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

  public addAnotherImage(){
    // let addImageDiv = document.createElement('div')
    // this.newImagesDiv.appendChild(addImageDiv)
    // addImageDiv.innerHTML = '<div class="card form-group"><div class="card-header"> Add image</div><div class="card-body"><div class="form-group myclass-choose-image"> <label for="exampleFormControlFile1">Choose an image from your system</label> <input type="file" accept="image/*" name="imageUrl" class="form-control-file myclass-image-url" ngModel (change)="getFiles($event)"><div class="myclass-image-thumbnail"> <img *ngIf="url" [src]="url"></div><div *ngIf="uploadImageError" class="alert alert-danger"> {{uploadImageError}}</div></div><div class="form-group myclass-image-description"> <label for="imageDescription"> Image description (optional) </label><textarea #description="ngModel" [(ngModel)]="image.description" maxlength="1000" class="form-control" id="imageDescription" name="description"></textarea><div *ngIf="description.invalid && (description.dirty || description.touched)" class="alert alert-danger"><div *ngIf=" description.errors.maxlength "> Descritpion can be max 1000 chars</div></div></div></div><div class="card-footer text-muted"> <a href="#" class="myclass-arrow-link"><i class="fas fa-arrow-alt-circle-up myclass-image-arrow "></i></a> <a href="#" class="myclass-arrow-link"><i class="fas fa-arrow-alt-circle-down myclass-image-arrow "></i></a></div></div>'

    let addImageDiv = '<div class="card form-group"><div class="card-header"> Add image</div><div class="card-body"><div class="form-group myclass-choose-image"> <label for="exampleFormControlFile1">Choose an image from your system</label> <input type="file" accept="image/*" name="imageUrl" class="form-control-file myclass-image-url" ngModel (change)="getFiles($event)"><div class="myclass-image-thumbnail"> <img *ngIf="url" [src]="url"></div><div *ngIf="uploadImageError" class="alert alert-danger"> {{uploadImageError}}</div></div><div class="form-group myclass-image-description"> <label for="imageDescription"> Image description (optional) </label><textarea #description="ngModel" [(ngModel)]="image.description" maxlength="1000" class="form-control" id="imageDescription" name="description"></textarea><div *ngIf="description.invalid && (description.dirty || description.touched)" class="alert alert-danger"><div *ngIf=" description.errors.maxlength "> Descritpion can be max 1000 chars</div></div></div></div><div class="card-footer text-muted"> <a href="#" class="myclass-arrow-link"><i class="fas fa-arrow-alt-circle-up myclass-image-arrow "></i></a> <a href="#" class="myclass-arrow-link"><i class="fas fa-arrow-alt-circle-down myclass-image-arrow "></i></a></div></div>'

      this.addImageDiv = addImageDiv

  }

}
