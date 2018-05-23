import { Component, OnInit, HostListener } from '@angular/core';
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


  public showedImagesNumber: number = 3
  // Ovde treba definisati subject, a ne injectirati ga u constructoru
  private subject: Subject<string> = new Subject()

  // Preporuceno ovde https://stackoverflow.com/questions/38083182/angular-2-media-queries
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // console.log(event.target.innerWidth);
    if(event.target.innerWidth < 575.98){
      this.showedImagesNumber = 2
    }else{
      this.showedImagesNumber = 3
    }
   
  }

  constructor(private galleryService: GalleryService) {

    // Ovako radis sa media querijima u javascriptu (vidi https://www.w3schools.com/howto/howto_js_media_queries.asp , https://www.sitepoint.com/javascript-media-queries/ , a ovde ti kaze da ga turis u konstruktor https://stackoverflow.com/questions/40137671/how-to-call-window-matchmedia-correctly-in-an-angular-2-app):
    let mediaQuery = window.matchMedia("(max-width: 575.98px)")
    this.screenWidthChange(mediaQuery)
    // Ovaj dole addListener je ok, medjutim tu dolazim do jednog jebenog problema, a to je da cim se on aktivira this u celoj funkciji vise ne pokazuje na celu komponentu ko sto bi trebalo, nego na MediaQueryList objekat i tu ti this postaje neupotrebljiv, tj ne mogu uopste da podesim this.showedImagesNumber (pokusavao sam i sa let self = this, ali dzaba ne ide...). Tako da sam, kad su real time promene sirine prozora u pitanju, to resio preko HostListener i radi!!! A ovo inicijalno skontavanje koja je sirina prozora u pitanju u momentu kad se otvori stranica radim pomocu koda iznad sa matchMedia...
    // mediaQuery.addListener(this.screenWidthChange)
   

  }

  ngOnInit() {
    // Da ova stranica uvek bude skrolovana do vrha
    window.scrollTo(0, 0)

  	this.galleryService.getGalleries().subscribe(
  	      data => {
            console.log(data);
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

      // kopiran kompletan zakomentarisan deo iz filterInput event hendlera dole uz neke dodatke:
        this.filteredGalleries = this.retrievedGalleries.filter((g: Gallery) => {

          // ovaj dodatni uslov sam morao da dodam, jer je description za galeriju opcioni unos pri kreiranju, pa kad ga ne unesem, on mi dole kenja kako ne moze da uradi toLocaleLowerCase na nepostojecem stringu...
          if (g.description) {
            return (g.name.toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()) || g.description.toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()) || (g.user.firstName + " " + g.user.lastName).toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()))
          }else{
            return (g.name.toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()) || (g.user.firstName + " " + g.user.lastName).toLocaleLowerCase().includes(filterTerm.toLocaleLowerCase()))
          }

          
        })

        // nisam siguran dal mi je potreban uopste ovaj uslov al ajd da ga stavim tu za svaki slucaj(proverio kasnije radi isto i sa ovim uslovom i bez, al mozda nije lose za svaki slucaj ga ostaviti tu):
        if(filterTerm === ''){
          this.filteredGalleries = this.retrievedGalleries
        }

        console.log(this.filteredGalleries.length);

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

/*Stara funkcija dok su slike bile u flexboxu
  public resizeImageIfVertical($event){
    // console.log($event);
    // kako dobaviti dimenzije slike https://davidwalsh.name/get-image-dimensions
    if (($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.2) {
      $event.path[0].style.width = '15%'
    }
  }*/

  public resizeImageIfVertical($event){
    // console.log($event);
    // kako dobaviti dimenzije slike https://davidwalsh.name/get-image-dimensions
    if (($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.5) {
      $event.path[0].style.width = '50%'
    } else if(($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.2){
      $event.path[0].style.width = '65%'
    }
  }

  public screenWidthChange(mediaQuery){
    // let self = this
    if (mediaQuery.matches) {
      // console.log(this);
      this.showedImagesNumber = 2
    } else {
      // console.log(self);
      this.showedImagesNumber = 3
    }
  }


}
