import { Component, OnInit, Input, ComponentRef, Renderer2, OnDestroy, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Gallery } from '../../shared/models/gallery';
import { Image } from '../../shared/models/image';
import { ImageComment } from '../../shared/models/image-comment';
import { ViewImageService } from '../../shared/services/view-image.service';
import { GalleryService } from '../../shared/services/gallery.service';
import { NgForm } from '@angular/forms'
import { HttpErrorResponse } from '@angular/common/http';
import { trigger,state,style,transition,animate,keyframes,sequence} from '@angular/animations';


@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.css'],
  animations: [
  // ideju za animaciju heighta sa '*', nasao na ovom linku https://stackoverflow.com/questions/42376006/angular2-ngfor-animation-of-pushed-away-elements . Naime, animacija heighta ti omogucuje da vidis ovo pomeranje osstalih komentara kad jedan komentar obrises. I kolko sam ja skontao fora je u tome sto ovom kojeg brises, njemu se height postepeno smanjuje dok ne nestane i to zapravo cini da se ovi komentari pomeraju animirano, ali nisu animirani oni vec height ovog sto nestaje.

  // isto ti je da li ces dole raditi sa sequence, ili ces redjati animate jedno za drugim, kao u primeru druge tranzicije (vidi https://angular.io/api/animations/sequence : "sequence Specifies a list of animation steps that are run one by one. (sequence is used by default when an array is passed as animation data into transition.)")
    trigger('fade', [
      transition('void => *', [
        style({opacity: 0, height: 0}),
        sequence([
          // stavljam 500ms delaya zbog skrola koji se desava prethodno
          animate('400ms 500ms', style({height: '*'})),
          animate('400ms', style({opacity: 1}))
        ])
        
      ]),
      transition('* => void', [
        animate('400ms', style({opacity: 0})),
        animate('400ms', style({height: 0}))
      ])  
    ])

  ]
})
export class ViewImageComponent implements OnInit, OnDestroy {

	private _imageID: number
	private _gallery: Gallery
	private galleryID: number
	private showingImage: Image
	private commentsArrayReversed: Array<ImageComment>
  public isUserAuthenticated: boolean
  public loggedUserEmail: string
  public imageComment: ImageComment = new ImageComment()
  public disableAnimations: boolean = true
  public disableProgressBar: number = 0
  @ViewChild("progressBar") progressBar: ElementRef
  @ViewChild("btnAddComment") btnAddComment: ElementRef
  // @ViewChild("addGalleryCommentForm") addGalleryCommentForm: FormGroup // radilo je i sa FormGroup samo sto izgleda nije pravilno jer je FormGroup za model driven ili ti reactive forme, a ova tvoja je template driven. Vidi ovde https://stackoverflow.com/questions/48681287/reset-form-from-parent-component. Inace ideju za FormGroup pokupio ovde: https://blog.angular-university.io/introduction-to-angular-2-forms-template-driven-vs-model-driven/ i https://codecraft.tv/courses/angular/forms/submitting-and-resetting/
  @ViewChild("addImageCommentForm") addImageCommentForm: NgForm //https://stackoverflow.com/questions/48681287/reset-form-from-parent-component
  @ViewChild("commentsContainer") commentsContainer: ElementRef
  @ViewChild("arrowLinkLeft") arrowLinkLeft: ElementRef
  @ViewChild("arrowLinkRight") arrowLinkRight: ElementRef
  @ViewChild("showingImageContainer") showingImageContainer: ElementRef
  

	@Input() componentReference: ComponentRef<any>
	// @Input() imageID: string
	@Input() set imageID(imageID: string){
		this._imageID = parseInt(imageID)
		if(this._gallery){
			this.showingImage = this._gallery.images.find(image => image.id === this._imageID)
      this.commentsArrayReversed = this.showingImage.comments.slice().reverse() //prvobitno pravljen pipe, al sam onda premestio reverse (pravljenje da ti niz bude u obrnutom redosledu) ovde, vidi odgovor od Thierry Templier https://stackoverflow.com/questions/35703258/invert-angular-2-ngfor
		}
	}
	@Input() set gallery(gallery: Gallery){
		this._gallery = gallery
		this.galleryID = gallery.id
		this.showingImage = this._gallery.images.find(image => image.id === this._imageID)
    this.commentsArrayReversed = this.showingImage.comments.slice().reverse() //prvobitno pravljen pipe, al sam onda premestio reverse (pravljenje da ti niz bude u obrnutom redosledu) ovde, vidi odgovor od Thierry Templier https://stackoverflow.com/questions/35703258/invert-angular-2-ngfor
	}

  constructor(private route: ActivatedRoute, private router: Router, private viewImageService: ViewImageService, private renderer: Renderer2, private galleryService: GalleryService) { 
    this.isUserAuthenticated = Boolean(window.localStorage.getItem('loginToken')); 
    this.loggedUserEmail = window.localStorage.getItem('loggedUserEmail')
  }

  ngOnInit() {
  	// console.log(this._gallery);
  	// console.log(this.componentReference);
  	// console.log(this._imageID);


  	// Pomocu ovoga se postize da se moze skrolovati samo ova komponenta, a pozadina da ne moze https://stackoverflow.com/questions/31906059/absolute-positioned-div-prevent-background-scroll?rq=1 . Inace ako hoces preko renderer-a da radis, moras raditi na ovaj nacin, tj. moras da napises document.body kao prvi argument funkcije, jer body ne mozes da targetiras preko ViewChild (vidi sta kaze Günter Zöchbauer https://stackoverflow.com/questions/39971762/add-class-to-body-on-angular2). Kao sto vidis na prethodnom linku koristi se fora da u glavnoj app komponenti podesis da ti njen selektor bude body tag umesto app-root taga, pa da onda koristis HostBinding kako bi stilizovao body. Ja to nisam hteo da radim, jer mi deluje prilicno hacky, pa sam koristio renderer na ovu foru, sto sam pokupio ovde https://stackoverflow.com/questions/43542373/angular2-add-class-to-body-tag , e sad da li je ovo saglasno pravilima angular dom manipulacije, to bas i ne znam, al na ovom linku niko ne spominje da nije saglasno (zapravo spominje se: "This won't work server-side as there's no document there." - mgol. Pa sad ako ti treba server side rendering, onda radi onako da stavljas body selektor u app komponentu... Imas to i na ovom linku https://stackoverflow.com/questions/39971762/add-class-to-body-on-angular2 i ovom https://stackoverflow.com/questions/34430666/angular-2-x-bind-class-on-body-tag/34430979#34430979, https://stackoverflow.com/questions/34636661/how-do-i-change-the-body-class-via-a-typescript-class-angular2/34637039#34637039, https://stackoverflow.com/questions/34881401/style-html-body-from-web-component-angular-2/34892496#34892496 i jos kolko oces mesta...)
  	this.renderer.setStyle(document.body, 'overflow', 'hidden')
  }

  public nextImage(){
    this.disableAnimations = true

  	let nextImageID: number
  	// Id sledece slike se mora traziti preko indexa te slike u nizu, ne mozes kao prethodno sto si radio samo da mu dodas 1, jer ne mora da znaci da su id-evi u bazi poredjani tako da je sledeci uvek za jedan veci od prethodnog, moguce je da ima rupa izmedju ako su npr. brisane slike
  	let currentImageIndex = this._gallery.images.findIndex(image => image.id === this._imageID)
  	if(this._gallery.images[currentImageIndex + 1]){
  		nextImageID = this._gallery.images[currentImageIndex + 1].id
  	}else{
  		nextImageID = this._gallery.images[0].id
  	}

		this.router.navigateByUrl('/galleries/' + this.galleryID +'/' + nextImageID);
  }

  public previousImage(){
    this.disableAnimations = true

  	let previousImageID: number
  	// Zasto trazis ovako, pogledaj gore objasnjenje unutar funkcije nextImage()
  	let currentImageIndex = this._gallery.images.findIndex(image => image.id === this._imageID)
  	let lastImageIndex: number = this._gallery.images.length - 1
  	if(this._gallery.images[currentImageIndex - 1]){
  		previousImageID = this._gallery.images[currentImageIndex - 1].id
  	}else{
  		previousImageID = this._gallery.images[lastImageIndex].id
  	}

		this.router.navigateByUrl('/galleries/' + this.galleryID + '/' + previousImageID);
  }

  public arrowsAnimate(event: any){

    if(event.type === 'mouseenter'){
     
      this.renderer.addClass(this.arrowLinkLeft.nativeElement, "myclass-carousel-arrow-link-left-animate")
      this.renderer.addClass(this.arrowLinkRight.nativeElement, 'myclass-carousel-arrow-link-right-animate')
      
      this.renderer.setStyle(this.arrowLinkLeft.nativeElement, 'pointer-events', 'auto')
      this.renderer.setStyle(this.arrowLinkRight.nativeElement, 'pointer-events', 'auto')
      
      
    }else if(event.type === 'mouseleave'){

      // Ovaj relatedTarget postoji na mouseleave eventu i odnosi se na onaj element na kojem se nadje kursor kad se desi mouseleave. Ovde mi se pojavljuje greska u konzoli ako se mouseleave desi na delu koji nije stranica (npr konzola) jer je tamo relatedTarget undefined pa moram da proveravam da li postoji relatedTarget
      if(event.relatedTarget){
        // Posto arrow cini link i ovaj <i> element koji se u domu pojavljuje kao svg i path element, ovde stavljam uslove za sve ovo sto sam naveo, a sam kod kaze sledece: ukoliko stavim kursor na arrow desice se mouseleave sa elementa (div koji okruzuje sliku) koji osluskuje mouseenter i mouseleave. U tom slucaju zelim da mi se ne desi da se strelice sklone i pomocu ovoga to sprecavam
        if(event.relatedTarget.id === "myid-carousel-arrow-left" || event.relatedTarget.id === "myid-carousel-arrow-right" || event.relatedTarget.id === "myid-carousel-arrow-left-link" || event.relatedTarget.id === "myid-carousel-arrow-right-link" || event.relatedTarget.parentElement.id === "myid-carousel-arrow-left" || event.relatedTarget.parentElement.id === "myid-carousel-arrow-right"){

            return;

             /* Kao sto vidis ovaj deo koda ti i nije potreban, ali vidis i sam da ti browseri cudno malo funkcionisu, tako da mozda ti ovo i zatreba, zasad je dovoljan ovaj return;

             this.renderer.addClass(this.arrowLinkLeft.nativeElement, "myclass-carousel-arrow-link-left-animate")
             this.renderer.setStyle(this.arrowLinkLeft.nativeElement, 'pointer-events', 'auto')

             this.renderer.addClass(this.arrowLinkRight.nativeElement, "myclass-carousel-arrow-link-right-animate")
             this.renderer.setStyle(this.arrowLinkRight.nativeElement, 'pointer-events', 'auto')*/
          
           // Testiranje:
           // this.renderer.setStyle(this.arrowLinkRight.nativeElement, 'background-color', 'yellow')
        }else{

          this.renderer.setStyle(this.arrowLinkLeft.nativeElement, 'pointer-events', 'none')
          this.renderer.setStyle(this.arrowLinkRight.nativeElement, 'pointer-events', 'none')
         

          this.renderer.removeClass(this.arrowLinkLeft.nativeElement, "myclass-carousel-arrow-link-left-animate")
          this.renderer.removeClass(this.arrowLinkRight.nativeElement, 'myclass-carousel-arrow-link-right-animate')

          // Testiranje:
          // this.renderer.setStyle(this.arrowLinkRight.nativeElement, 'background-color', 'blue')
          // console.log(event.relatedTarget);
          // console.log(event);
        }

      }else{
        
        // Jbg sad ovde moram da dupliram kod iz ovog elsa iznad, jer sam morao da stavim gore dva if-a da mi ne bi izbacivao greske u konzoli...
        this.renderer.setStyle(this.arrowLinkLeft.nativeElement, 'pointer-events', 'none')
        this.renderer.setStyle(this.arrowLinkRight.nativeElement, 'pointer-events', 'none')

        this.renderer.removeClass(this.arrowLinkLeft.nativeElement, "myclass-carousel-arrow-link-left-animate")
        this.renderer.removeClass(this.arrowLinkRight.nativeElement, 'myclass-carousel-arrow-link-right-animate')

        // Testiranje:
        // this.renderer.setStyle(this.arrowLinkRight.nativeElement, 'background-color', 'red')
      }


    }
  }

  // Ova funkcija je tu sad zapravo za svaki slucaj, jer sam ovu gore arrowsAnimate() naterao da radi kako treba, al nek ova ipak ostane tu. Njena poenta je u tome da kad predjes preko strelica da se ne desi ono sto je definisano za mouseleave event u arrowsAnimate(), konkretno da ti na hover preko strelica arrowsAnimate() ne odradi standardnu akciju za mouseleave a to je da ti skloni strelice! Sa onim silnim if uslovima u arrowsAnimate() je to reseno i radi u svim browserima koje sam ja testirao, a za ostale verzije i druge browsere nisam siguran, pa nek ostane za svaki slucaj i ovo cudo ovde...
  public arrowsAnimatePreventHover(event: Event){
         
     this.renderer.addClass(this.arrowLinkLeft.nativeElement, "myclass-carousel-arrow-link-left-animate")
     this.renderer.setStyle(this.arrowLinkLeft.nativeElement, 'pointer-events', 'auto')
     this.renderer.addClass(this.arrowLinkRight.nativeElement, "myclass-carousel-arrow-link-right-animate")
     this.renderer.setStyle(this.arrowLinkRight.nativeElement, 'pointer-events', 'auto')
    
  }

  public closeImage(){
  	this.router.navigateByUrl('/galleries/' + this.galleryID);
  	this.viewImageService.destroyComponent(this.componentReference)
  }

  public addImageComment(){
   this.disableAnimations = false
   this.showLoaderDisablePageElements(true)
   this.renderer.setProperty(this.btnAddComment.nativeElement, 'disabled', true)

    this.galleryService.addImageComment(this.imageComment, this.showingImage).subscribe((data: { storedCommentWithUser: ImageComment, gallery: Gallery}) => {
      this.addImageCommentForm.reset()
      // console.log(this.imageComment);
      this.commentsContainer.nativeElement.scrollIntoView({ behavior: "smooth", block: "start"})
      console.log(data);
      this.commentsArrayReversed.unshift(data.storedCommentWithUser)
      // Pri svakoj promeni galerije kao sto je dodavanje ili brisanje komentara, moram ponovo da dobavim galeriju da ne bi koristio stare podatke:
      this._gallery = data.gallery
      // A moram ih proslediti i pozadinskoj view gallery komponenti jer su i u njoj jos stari podaci. Koristim komunikaciju parenta i childa preko servisa kao i ovde https://angular.io/guide/component-interaction#parent-and-children-communicate-via-a-service
      this.viewImageService.setGalleryUpdatedImageComments(data.gallery)

      this.showLoaderDisablePageElements(false)
    }, (error: HttpErrorResponse) => {
      this.showLoaderDisablePageElements(false)
      this.renderer.setProperty(this.btnAddComment.nativeElement, 'disabled', false)

      //sa for in iteracijom, nisam uspeo da dobavim ove greske, ova funkcija Object.values() je pravo cudo!
      if(error.error.errors){
        let errors = Object.values(error.error.errors) 
        let errorString: string = ''
        errors.forEach(function(message){
          errorString += message + '\n'
        });
        alert(errorString);
        
      }else{
        alert(error.error.error)
      }
    })
  }

  public deleteImageComment(comment: ImageComment){
    this.disableAnimations = false
    if(confirm('Are you sure you want to delete this comment?')){

      this.showLoaderDisablePageElements(true)
      // console.log(comment);
      this.galleryService.deleteImageComment(comment).subscribe((gallery: Gallery) => {
        console.log(comment);
        // ovaj indexOf nije hteo da funkcionise kad bi vracao obrisan komentar sa backenda iako bi rekao da su ta dva objekta identicna, sa ovim comment funkcionise...
        /*let indexCommentsArrayReversed = this.commentsArrayReversed.indexOf(comment)*/
        // console.log(indexCommentsArrayReversed);
        // Ovaj splice metod ima neke 'kontroverze' doduse, mada mislim da meni ovde nece praviti problem (vidi https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value , https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript i sl.)
        /*if(indexCommentsArrayReversed !== -1){
          this.commentsArrayReversed.splice(indexCommentsArrayReversed, 1)
        }*/

        // element niza ipak brisem preko filter funkcije (potrazi ovde: https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value) zato sto se teoretski po mom misljenju moze desiti slucaj da se izmedju dva koraka od koliko se sastoji metoda sa splice promeni index od elementa koji hocu da brisem, ukoliko se npr bas izmedju ta dva koraka doda novi element u niz, tako da bi ovo sa filterom trebalo da bude sigurnija metoda:
        this.commentsArrayReversed = this.commentsArrayReversed.filter(c => c !== comment)
        // Pri svakoj promeni galerije kao sto je dodavanje ili brisanje komentara, moram ponovo da dobavim galeriju da ne bi koristio stare podatke:
        this._gallery = gallery
        // A moram ih proslediti i pozadinskoj view gallery komponenti jer su i u njoj jos stari podaci. Koristim komunikaciju parenta i childa preko servisa kao i ovde https://angular.io/guide/component-interaction#parent-and-children-communicate-via-a-service
        this.viewImageService.setGalleryUpdatedImageComments(gallery)


        this.showLoaderDisablePageElements(false)
      }, (error: HttpErrorResponse) => {
        this.showLoaderDisablePageElements(false)

        alert(error.error.error)
      })

    }

    
  }

 
  public showLoaderDisablePageElements(show: boolean){
    if(show === true){
      // this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')
      // this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'visible')
      this.disableProgressBar++
      console.log(this.disableProgressBar);
      // this.renderer.setProperty(this.btnAddComment.nativeElement, 'disabled', true)
    }else{
      // this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
      // this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'hidden')
      this.disableProgressBar--
      console.log(this.disableProgressBar);
      // this.renderer.setProperty(this.btnAddComment.nativeElement, 'disabled', false)
    }
  }

  // Vidi https://stackoverflow.com/questions/38405703/function-callback-after-animation-ends-in-angular-2, https://angular.io/guide/animations#animation-callbacks
  animationDone($event){
    this.disableAnimations = true
  }

  public resizeImageIfVertical($event){
    console.log($event.target);
    // kako dobaviti dimenzije slike https://davidwalsh.name/get-image-dimensions
    /*if (($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.5) {
      // $event.path[0].style.maxWidth = '35%'
      const image = $event.path[0]
      this.renderer.setStyle(image, 'max-width', '35%')
    } else if(($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.2){
      $event.path[0].style.maxWidth = '50%'
    }else{
      $event.path[0].style.maxWidth = '100%'
    }*/

    if (($event.target.naturalHeight / $event.target.naturalWidth) >= 1.5) {
      // $event.target.style.maxWidth = '35%'
      const image = $event.target
      this.renderer.setStyle(image, 'max-width', '35%')
    } else if(($event.target.naturalHeight / $event.target.naturalWidth) >= 1.2){
      $event.target.style.maxWidth = '50%'
    }else{
      $event.target.style.maxWidth = '100%'
    }

  }

  ngOnDestroy(){
  	this.renderer.setStyle(document.body, 'overflow', 'visible') //visible je default vrednost https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
  }


}
