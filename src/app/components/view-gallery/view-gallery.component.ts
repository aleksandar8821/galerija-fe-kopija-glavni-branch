import { Component, OnInit, ViewChild, ElementRef, Renderer2, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Gallery } from '../../shared/models/gallery'; 
import { GalleryComment } from '../../shared/models/gallery-comment'; 
import { GalleryService } from '../../shared/services/gallery.service';
import { trigger,state,style,transition,animate,keyframes,sequence} from '@angular/animations';
import { FormGroup, NgForm } from '@angular/forms'
import { ViewImageComponent } from '../../components/view-image/view-image.component';
import { ViewImageService } from '../../shared/services/view-image.service';


@Component({
  selector: 'app-view-gallery',
  templateUrl: './view-gallery.component.html',
  styleUrls: ['./view-gallery.component.css'],
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
export class ViewGalleryComponent implements OnInit {

  public gallery: Gallery
  public commentsArrayReversed: Array<GalleryComment>
  public galleryComment: GalleryComment = new GalleryComment()
  public isUserAuthenticated: boolean
  public loggedUserEmail: string
  public disableAnimations: boolean = true
  public disableProgressBar: number = 0
  @ViewChild("progressBar") progressBar: ElementRef
  @ViewChild("btnAddComment") btnAddComment: ElementRef
  @ViewChild("disabledOverlay") disabledOverlay: ElementRef
  // @ViewChild("addGalleryCommentForm") addGalleryCommentForm: FormGroup // radilo je i sa FormGroup samo sto izgleda nije pravilno jer je FormGroup za model driven ili ti reactive forme, a ova tvoja je template driven. Vidi ovde https://stackoverflow.com/questions/48681287/reset-form-from-parent-component. Inace ideju za FormGroup pokupio ovde: https://blog.angular-university.io/introduction-to-angular-2-forms-template-driven-vs-model-driven/ i https://codecraft.tv/courses/angular/forms/submitting-and-resetting/
  @ViewChild("addGalleryCommentForm") addGalleryCommentForm: NgForm //https://stackoverflow.com/questions/48681287/reset-form-from-parent-component
  @ViewChild("commentsContainer") commentsContainer: ElementRef
  @ViewChild("viewImageViewContainerRef", {read: ViewContainerRef}) viewImageViewContainerRef: ViewContainerRef;

  constructor(private galleryService: GalleryService, private route: ActivatedRoute, private renderer: Renderer2, private router: Router, private viewImageService: ViewImageService) {
    
    // ******************************************************************** //
    // Pomocu ovoga uspevam da mi se komponenta ne refreshuje (ne inicijalizuje ponovo) kad je dve razlicite rute otvaraju i zasad radi, nasao ovde https://stackoverflow.com/questions/45497208/how-to-change-to-route-with-same-component-without-page-reload , koristi se ocigledno ovo ili nesto jako slicno tome https://angular.io/api/router/RouteReuseStrategy
    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return true;
    };
    this.router.events.subscribe((evt) => {
        if (evt instanceof NavigationEnd) {
            this.router.navigated = false;
        }
    });
    // ******************************************************************** //
    this.isUserAuthenticated = Boolean(window.localStorage.getItem('loginToken')); 
    this.loggedUserEmail = window.localStorage.getItem('loggedUserEmail')
  }

  ngOnInit() {

    // bar po ovom (https://scotch.io/tutorials/handling-route-parameters-in-angular-v2) ovo bi moralo da se radi preko paramMap, jer on vraca Observable, ma pogledaj link samo
    this.route.paramMap.subscribe(params => {
      let imageID = params.get('imageID')
      console.log(imageID);
      if(imageID){
        this.viewImageService.setViewContainerRef(this.viewImageViewContainerRef)
        this.viewImageService.setGallery(this.gallery)
        this.viewImageService.setGalleryID(params.get('galleryID'))
        this.viewImageService.setImageID(imageID)
        this.viewImageService.addDynamicComponent(ViewImageComponent)
      }
  		let galleryID = params.get('galleryID')
      if(!this.gallery){
          this.galleryService.getSpecificGallery(galleryID).subscribe((gallery: Gallery) => {
            this.gallery = gallery
            this.commentsArrayReversed = gallery.comments.slice().reverse() //prvobitno pravljen pipe, al sam onda premestio reverse (pravljenje da ti niz bude u obrnutom redosledu) ovde, vidi odgovor od Thierry Templier https://stackoverflow.com/questions/35703258/invert-angular-2-ngfor

            // console.log(this.commentsArrayReversed);
            console.log(gallery);
          }, (err: HttpErrorResponse) => {
            alert(`Server returned code ${err.status} with message: ${err.error.message}`);
            console.log(err)
          })
      }
  		
  	})

  }
 

  public resizeImageIfVertical($event){
    // console.log($event);
    // kako dobaviti dimenzije slike https://davidwalsh.name/get-image-dimensions
    if (($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.5) {
      $event.path[1].style.width = '50%'
    } else if(($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.2){
      $event.path[1].style.width = '65%'
    }
  }

  public addGalleryComment(){
   this.disableAnimations = false
   this.showLoaderDisablePageElements(true)
   this.renderer.setProperty(this.btnAddComment.nativeElement, 'disabled', true)

    this.galleryService.addGalleryComment(this.galleryComment, this.gallery).subscribe((storedComment: GalleryComment) => {
      this.addGalleryCommentForm.reset()
      // console.log(this.galleryComment);
      this.commentsContainer.nativeElement.scrollIntoView({ behavior: "smooth", block: "start"})
      this.commentsArrayReversed.unshift(storedComment)

      this.showLoaderDisablePageElements(false)
    }, (error: HttpErrorResponse) => {
      this.showLoaderDisablePageElements(false)
      this.renderer.setProperty(this.btnAddComment.nativeElement, 'disabled', false)

      //sa for in iteracijom, nisam uspeo da dobavim ove greske, ova funkcija Object.values() je pravo cudo!
      let errors = Object.values(error.error.errors) 
      let errorString: string = ''
      errors.forEach(function(message){
        errorString += message + '\n'
      });
      alert(errorString);
    })
  }

  public deleteGalleryComment(comment: GalleryComment){
    this.disableAnimations = false
    if(confirm('Are you sure you want to delete this comment?')){

      this.showLoaderDisablePageElements(true)
      // console.log(comment);
      this.galleryService.deleteGalleryComment(comment).subscribe((deletedComment: GalleryComment) => {
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


}
