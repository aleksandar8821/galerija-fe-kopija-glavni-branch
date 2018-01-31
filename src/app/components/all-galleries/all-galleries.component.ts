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

  public retrievedGalleries: Array<Gallery>
	public filteredGalleries: Array<Gallery>


  // Galerije koje se prikazuju preko load more button-a
  public showedGalleries: Array<Gallery>
  readonly galleriesLoadNumber: number = 2
  readonly initiallyShowedGalleriesNumber: number = 2
  public showedGalleriesNumber: number = this.initiallyShowedGalleriesNumber
  public filterInput: any //document.getElementById ne mozes pozvati ovde, jer ovog jos nece biti u domu tad

  public btnDisabled: boolean = true

  constructor(private galleryService: GalleryService) { }

  ngOnInit() {
  	this.galleryService.getGalleries().subscribe(
  	      data => {
  	        this.retrievedGalleries = data;
            // this.loadGalleries()

            this.showedGalleries = this.retrievedGalleries.slice(0, this.initiallyShowedGalleriesNumber)

            if(this.showedGalleries.length === this.retrievedGalleries.length){
              this.btnDisabled = true
            }
            else{
              this.btnDisabled =  false
            }

            // Filtriranje galerija
            this.filterInput = document.getElementById('filter-galleries-input')
            this.filterInput.addEventListener('keyup', (e) => { let filterTerm = e.target.value.toLowerCase()

               this.filteredGalleries = this.retrievedGalleries.filter((g: Gallery) => {
                 return (g.name.toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()) || g.description.toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()) || (g.user.firstName + " " + g.user.lastName).toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()))
               })

               this.showedGalleries = this.filteredGalleries.slice(0, this.initiallyShowedGalleriesNumber)

               if(this.showedGalleries.length === this.filteredGalleries.length){
                 this.btnDisabled = true
               }
               else{
                 this.btnDisabled =  false
               }


               // Resetovanje showedGalleriesNumber
               this.showedGalleriesNumber = this.initiallyShowedGalleriesNumber
            })



  	      },
  	      (err: HttpErrorResponse) => {
  	        alert(`Backend returned code ${err.status} with message: ${err.error.message}`);
  	        console.log(err)
  	      }
  	);


  }

  public loadGalleries(){
    // this.showedGalleriesNumber += this.galleriesLoadNumber
    // if(this.filteredGalleries){
    //   this.showedGalleries = this.filteredGalleries.slice(0, this.showedGalleriesNumber)
    // }
    // else{
    //   this.showedGalleries = this.retrievedGalleries.slice(0, this.showedGalleriesNumber)
    // }

    this.showedGalleriesNumber += this.galleriesLoadNumber
    if(this.filteredGalleries){
      console.log(this.showedGalleriesNumber)
      this.showedGalleries = this.filteredGalleries.slice(0, this.showedGalleriesNumber)
      if(this.showedGalleries.length === this.filteredGalleries.length){
        this.btnDisabled = true
      }
    }
    else{
      this.showedGalleries = this.retrievedGalleries.slice(0, this.showedGalleriesNumber)
      if(this.showedGalleries.length === this.retrievedGalleries.length){
        this.btnDisabled = true
      }
    }
  }


}
