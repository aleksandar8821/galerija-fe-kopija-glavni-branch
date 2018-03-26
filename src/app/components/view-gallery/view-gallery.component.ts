import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Gallery } from '../../shared/models/gallery'; 
import { GalleryComment } from '../../shared/models/gallery-comment'; 
import { GalleryService } from '../../shared/services/gallery.service';


@Component({
  selector: 'app-view-gallery',
  templateUrl: './view-gallery.component.html',
  styleUrls: ['./view-gallery.component.css']
})
export class ViewGalleryComponent implements OnInit {

  public gallery: Gallery
  public galleryComment: GalleryComment = new GalleryComment()

  constructor(private galleryService: GalleryService, private route: ActivatedRoute) { }

  ngOnInit() {
  	// bar po ovom (https://scotch.io/tutorials/handling-route-parameters-in-angular-v2) ovo bi moralo da se radi preko paramMap, jer on vraca Observable, ma pogledaj link samo
  	this.route.paramMap.subscribe(params => {
  		let id = params.get('id')
  		this.galleryService.getSpecificGallery(id).subscribe((gallery: Gallery) => {
        this.gallery = gallery
        console.log(gallery);
  		}, (err: HttpErrorResponse) => {
        alert(`Server returned code ${err.status} with message: ${err.error.message}`);
        console.log(err)
      })
  	})

  }

  public resizeImageIfVertical($event){
    // console.log($event);
    // kako dobaviti dimenzije slike https://davidwalsh.name/get-image-dimensions
    if (($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.5) {
      $event.path[1].style.width = '50%'
    }
  }

  public addGalleryComment(){
    this.galleryService.addGalleryComment(this.galleryComment, this.gallery).subscribe((storedComment: GalleryComment) => {
      console.log(storedComment);
    })
  }

}
