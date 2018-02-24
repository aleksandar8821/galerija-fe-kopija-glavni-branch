import { Component, OnInit } from '@angular/core';
import { Gallery } from '../../shared/models/gallery';
import { Image } from '../../shared/models/image';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

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
  
  getFiles(event){ 
      this.files = event.target.files;
      // console.log(this.files[0]);
      this.selectedImage = event.target.files[0]
      // Na ovaj nacin prikazujem thumbnail nakon uploada fajla (prekopirano odavde: https://stackoverflow.com/questions/39074806/how-to-preview-picture-stored-in-the-fake-path-in-angular-2-typescript   isto imas i ovde: https://stackoverflow.com/questions/4459379/preview-an-image-before-it-is-uploaded?rq=1)
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();

        reader.onload = (event:any) => {
          this.url = event.target.result;
        }

        reader.readAsDataURL(event.target.files[0]);
      }     
  } 

  logForm(event) { 
       console.log(this.files); 
  } 
  
  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
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

}
