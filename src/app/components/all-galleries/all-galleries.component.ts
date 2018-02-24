import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../../shared/services/gallery.service';
import { Gallery } from '../../shared/models/gallery'; 
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators'

@Component({
  selector: 'app-all-galleries',
  templateUrl: './all-galleries.component.html',
  styleUrls: ['./all-galleries.component.css']
})
export class AllGalleriesComponent implements OnInit {

  public retrievedGalleries: Array<Gallery>
	public filteredGalleries: Array<Gallery>


  // Galerije koje se prikazuju preko load more button-a
  public showedGalleries: Array<Gallery> = []
  readonly galleriesLoadNumber: number = 2
  readonly initiallyShowedGalleriesNumber: number = 2
  public showedGalleriesNumber: number = this.initiallyShowedGalleriesNumber
  public filterInput: any //document.getElementById ne mozes pozvati ovde, jer ovog jos nece biti u domu tad

  public btnDisabled: boolean = true
  public noGalleriesAtAll: boolean = false
  public noGalleriesWithFilterTerm : boolean = false

  constructor(private galleryService: GalleryService, private subject: Subject<string>) { }

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

            if(this.showedGalleries.length === 0){
              this.noGalleriesAtAll = true
            }

  	      },
  	      (err: HttpErrorResponse) => {
  	        alert(`Server returned code ${err.status} with message: ${err.error.message}`);
            this.noGalleriesAtAll = true
  	        console.log(err)
  	      }
  	);


    //odradjen debounce sa ovog linka (https://stackoverflow.com/questions/42761163/angular-2-debouncing-a-keyup-event), pogledati ovo jos malo, cini mi se da su druga resenja opsirnija malo, mada ovo radi zasad posao. Dodato: ovaj link je jos pribliznji mom resenju(odgovor nakon prihvacenog): https://stackoverflow.com/questions/32051273/angular-and-debounce . A i ovde je slicno https://www.reddit.com/r/Angular2/comments/52xzi0/why_in_the_heck_is_debounce_so_complicated_in/ 
    this.subject.debounceTime(500).distinctUntilChanged().subscribe(filterTerm => {

      console.log('eve me!')

      // kopiran kompletan zakomentarisan deo iz filterInput event hendlera dole:
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

        if(this.showedGalleries.length === 0){
          this.noGalleriesWithFilterTerm = true
        }else{
          this.noGalleriesWithFilterTerm = false
        }

         // Resetovanje showedGalleriesNumber
         this.showedGalleriesNumber = this.initiallyShowedGalleriesNumber
      });

   


    // Filtriranje galerija
    this.filterInput = document.getElementById('filter-galleries-input')
    this.filterInput.addEventListener('keyup', (e) => { 

      let filterTerm = e.target.value.toLowerCase()

      this.subject.next(filterTerm)

      // kod kopiran gore u subject, zbog debounce-a
      // this.filteredGalleries = this.retrievedGalleries.filter((g: Gallery) => {
      //   return (g.name.toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()) || g.description.toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()) || (g.user.firstName + " " + g.user.lastName).toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()))
      // })

      // this.showedGalleries = this.filteredGalleries.slice(0, this.initiallyShowedGalleriesNumber)

      // if(this.showedGalleries.length === this.filteredGalleries.length){
      //   this.btnDisabled = true
      // }
      // else{
      //   this.btnDisabled =  false
      // }

      // if(this.showedGalleries.length === 0){
      //   this.noGalleriesWithFilterTerm = true
      // }else{
      //   this.noGalleriesWithFilterTerm = false
      // }

      //  // Resetovanje showedGalleriesNumber
      //  this.showedGalleriesNumber = this.initiallyShowedGalleriesNumber
    })



    //Popover, odnosno tooltip
    let popoverTarget = document.querySelector('.myclass-popover-div-wrapper');

    
    popoverTarget.addEventListener('mouseenter', (e) => {

      let btnLoadMore = document.querySelector("#myid-btnLoadMore") as any

      if(btnLoadMore.disabled === true){
        let popoverMsg = document.querySelector('.myclass-new-popover-wrapper') as any
        // console.dir(popoverMsg)
        popoverMsg.style.visibility = 'visible'
      }

      // console.log('1')
      
    })

    //kod za smartphone, ipad-e i ostale touch screen uredjaje:
    popoverTarget.addEventListener('touchstart', (e) => {

      let btnLoadMore = document.querySelector("#myid-btnLoadMore") as any

      if(btnLoadMore.disabled === true){
        let popoverMsg = document.querySelector('.myclass-new-popover-wrapper') as any
        // console.dir(popoverMsg)
        popoverMsg.style.visibility = 'visible'
      }

      // console.log('2')
      
    })

    popoverTarget.addEventListener('mouseleave', (e) => {

      let btnLoadMore = document.querySelector("#myid-btnLoadMore") as any

      if(btnLoadMore.disabled === true){
        let popoverMsg = document.querySelector('.myclass-new-popover-wrapper') as any
        // console.dir(popoverMsg)
        popoverMsg.style.visibility = 'hidden'
      }

      // console.log('3')
      
    })

    // kod za touch screenove za evente touchend i touchleave nije radio kako treba (prvi je ucinio da popover blinka, a drugi uopste nije reagovao!), pa je sklonjen, inace radi i na mobilnim uredjajima (unutar google dev tools simulatora) sa mouseleave


    //Ispravljanje greske kod popovera (ne mog nego instaliranog https://www.npmjs.com/package/ngx-popover), gde se desava da kada nakon hoverovanja preko buttona kad brzo hoverujes na sam popover, trouglic ostane visible. Ovim dole je reseno da kad god predjes misem preko necega sto nije button da trouglicev visibility postane hidden
/*    let body = document.querySelector('body')

    body.addEventListener('mouseenter', (e) => {

      // setTimeout(function(){
      //   let popoverDiv = document.querySelector('.popover-content')
      //   console.dir(popoverDiv)
      // }, 1000)
      
      // console.log(popoverTarget)

      //kreiraj text node

      let btnLoadMore = document.querySelector("#myid-btnLoadMore") as any

      if(btnLoadMore.disabled === true){
        let popoverArrow = document.querySelector('#myid-load-more-popover-arrow') as any
        // console.dir(popoverArrow)
        popoverArrow.style.visibility = 'hidden'
      }

      // console.log('asdifasndij')
      
    })*/

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
