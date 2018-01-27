import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../../shared/services/gallery.service';
import { Gallery } from '../../shared/models/gallery'; 
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-all-galleries',
  templateUrl: './all-galleries.component.html',
  styleUrls: ['./all-galleries.component.css']
})
export class AllGalleriesComponent implements OnInit {

	public galleries: Array<Gallery>

  constructor(private galleryService: GalleryService) { }

  ngOnInit() {
  	this.galleryService.getGalleries().subscribe(
  	      data => {
  	        this.galleries = data;
  	        console.log(this.galleries)
  	      },
  	      (err: HttpErrorResponse) => {
  	        alert(`Backend returned code ${err.status} with message: ${err.error.message}`);
  	        console.log(err)
  	      }
  	);
  }

}
