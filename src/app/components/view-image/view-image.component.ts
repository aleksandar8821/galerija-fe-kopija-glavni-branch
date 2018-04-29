import { Component, OnInit, Input, ComponentRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Gallery } from '../../shared/models/gallery';
import { Image } from '../../shared/models/image';
import { ImageComment } from '../../shared/models/image-comment';
import { GalleryService } from '../../shared/services/gallery.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.css']
})
export class ViewImageComponent implements OnInit {

	private _imageID: number
	private showingImage: Image
	private commentsArrayReversed: Array<ImageComment>

	@Input() componentReference: ComponentRef<any>
	@Input() gallery: Gallery
	@Input() galleryID: string
	// @Input() imageID: string
	@Input() set imageID(imageID: string){
		this._imageID = parseInt(imageID)
		
		if(this.gallery){
			this.showingImage = this.gallery.images.find(image => image.id === this._imageID)
			
		}else{
			this.galleryService.getSpecificGallery(this.galleryID).subscribe((gallery: Gallery) => {
            this.gallery = gallery
            this.showingImage = this.gallery.images.find(image => image.id === this._imageID)
            this.commentsArrayReversed = this.showingImage.comments.slice().reverse() //prvobitno pravljen pipe, al sam onda premestio reverse (pravljenje da ti niz bude u obrnutom redosledu) ovde, vidi odgovor od Thierry Templier https://stackoverflow.com/questions/35703258/invert-angular-2-ngfor

            // console.log(this.commentsArrayReversed);
            console.log(gallery);
          }, (err: HttpErrorResponse) => {
            alert(`Server returned code ${err.status} with message: ${err.error.message}`);
            console.log(err)
          })
		}

	}

  constructor(private route: ActivatedRoute, private galleryService: GalleryService) { }

  ngOnInit() {
  	console.log(this.gallery);
  	console.log(this.componentReference);
  	console.log(this.imageID);
  }

}
