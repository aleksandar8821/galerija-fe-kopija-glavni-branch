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
  providers: [ ViewImageService ],
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
  @ViewChild("galleryStart") galleryStart: ElementRef

  constructor(private galleryService: GalleryService, private route: ActivatedRoute, private renderer: Renderer2, private router: Router, private viewImageService: ViewImageService) {
    
    // ******************************************************************** //
    // Pomocu ovoga uspevam da mi se komponenta ne refreshuje (ne inicijalizuje ponovo, nego da se reuse-uje) kad je dve razlicite rute otvaraju i zasad radi!!! Ovo resenje je inace kombinacija sa ova dva linka https://github.com/angular/angular/issues/12446 (vidi odgovor od DanielKucal, a slicnu stvar imas od istog korisnika ovde https://stackoverflow.com/questions/44875644/custom-routereusestrategy-for-angulars-child-module/44876414#44876414) i https://stackoverflow.com/questions/45497208/how-to-change-to-route-with-same-component-without-page-reload . Sa prvog linka koristim ovaj deo iza returna i to sto unutar app-routing modula stavljam  data: { reuse: true } na rute koje zelim da se reuse-uju (reuse znaci da se ne inicijalizuju ponovo kad ih aktiviram nego da koriste vec prethodno izrenderovane stranice), a sa drugog linka sam skinuo ideju da ovo stavim u konstruktor komponente koju zelim da reuseujem. Metoda koju koristim se moze naci ovde https://angular.io/api/router/RouteReuseStrategy. 
    this.router.routeReuseStrategy.shouldReuseRoute = (future, curr) => {
      return (future.routeConfig === curr.routeConfig) || future.data.reuse;
    };
    // ******************************************************************** //
    this.isUserAuthenticated = Boolean(window.localStorage.getItem('loginToken')); 
    this.loggedUserEmail = window.localStorage.getItem('loggedUserEmail')

    // Kada se dodaju ili obrisu komentari na slikama, potrebno je te podatke obnoviti i ovde u parent komponenti. Koristim komunikaciju parenta i childa preko servisa kao i ovde https://angular.io/guide/component-interaction#parent-and-children-communicate-via-a-service
    this.viewImageService.galleryUpdatedImageComments.subscribe(galleryUpdatedImageComments => this.gallery = galleryUpdatedImageComments)
  }

  ngOnInit() {
    // Da ova stranica po defaultu bude skrolovana do vrha, posle ima odstupanja nekih 
    window.scrollTo(0, 0)

    // bar po ovom (https://scotch.io/tutorials/handling-route-parameters-in-angular-v2) ovo bi moralo da se radi preko paramMap, jer on vraca Observable, ma pogledaj link samo
    this.route.paramMap.subscribe(params => {
      let imageID = params.get('imageID')
      // console.log(imageID);
      if(imageID){
        // Ako je view image komponenta vec instancirana, znaci da promena imageID u url-u oznacava da unutar view image komponente hocu da predjem na drugu sliku, i tada nema potrebe ponovo setovati sve, vec samo imageID
        if(this.viewImageService.componentRef){
          this.viewImageService.setImageID(imageID)
        }else{
          // Ako dolazim direktno na link slike a da pre toga nisam bio na galeriji (a to znaci da imam id slike u url-u, a galerija nije jos loadovana unutar komponente galerije), onda hocu da mi se galerija u pozadini skroluje do imena galerije, da kad zatvorim sliku odmah skontam da se nalazim na galeriji koja sadrzi sliku!
          if(!this.gallery){
            this.galleryStart.nativeElement.scrollIntoView()
          }

          this.viewImageService.setViewContainerRef(this.viewImageViewContainerRef)
          this.viewImageService.addDynamicComponent(ViewImageComponent)
          this.viewImageService.setImageID(imageID)
          // Ako je galerija vec dobavljena u komponenti za galeriju, nema potrebe da komponenta za sliku ponovo pravi zahtev za dobavljanje galerije, pa joj ovako prosledjivam, u suprotnom ako se na sliku dolazi preko spoljnog linka, galerije ovde sigurno jos ne moze biti, pa joj prosledjujem galeriju kada je dobavim dole u getSpecificGallery() metodi. U SVAKOM SLUCAJU VAZNO JE DA PRI KREIRANJU VIEW IMAGE KOMPONENTE DA SE GALERIJA UVEK POSLEDNJA SETUJE, JER SE (UNUTAR VIEW IMAGE KOMPONENTE) POMOCU NJE DOLAZI DO SLIKE I OSTALIH PODATAKA!
          if(this.gallery){
            this.viewImageService.setGallery(this.gallery)
          }

        }
        
      }else{
        // Ako nemam imageID u url, a view image komponenta je vec kreirana, to znaci da sam otisao sa view image komponente na stranicu view gallery komponente i da ne zelim vise da mi bude nekakva slika prikazana, zato je i fala Bogu brisem
        if(this.viewImageService.componentRef){
          this.viewImageService.destroyComponent(this.viewImageService.componentRef)
        }
      }
      
      // Ovaj uslov if(!this.gallery) je svakako potreban jer se kompletan kod unutar this.route.paramMap.subscribe gde se i sad nalazim, izvrsava svaki put kad se ruta promeni, a ovde je to predvidjeno da se cesto desava! Da nema ovog uslova tebi bi se svaki put iznova dobavljala galerija sa backenda na svaku promene rute! Takodje potreban je i zbog koraka this.viewImageService.setGallery jer nema smisla da ti se ponovo setuje galerija u view image komponenti (gore u kodu je vec jednom setujes ako u tom trenutku postoji dobavljena galerija), jedino ima smisla da je ovde setujes ako se slika posecuje sa spoljnog linka i view gallery komponenta jos nema dobavljenu galeriju (sto i kaze uslov if(!this.gallery)) pa ti ipak prvo kreiras view image komponentu da ti korisnik ne bi cekao dobavljanje galerije pa da tek onda krene formiranje view image komponente (ovako je ti odma formiras al bez slike), pa tek kad stigne galerija ti ces je proslediti view image komponenti. Dakle, kad sliku otvaras preko spoljnog linka, prvo se otvara stranica galerije kojoj ta slika pripada, pa se odmah formira kostur komponente koja treba da prikaze pojedinacnu sliku iako jos nema dobavljenu tu sliku, pa posto komponenti galerije stignu podaci ona ih naravno prikazuje u pozadini u sopstvenom UI, a komponenti slike salje te podatke i tek onda ona moze da prikaze sliku i naravno sve podatke vezane za nju. Uh!!! jbt... Naravno potreban je i uslov if(this.viewImageService.componentRef) jer ako on nije zadovoljen, to znaci da se radi o slucaju da ti ni neces da gledas pojedinacnu sliku nego samo galeriju.
      if(!this.gallery){
      		let galleryID = params.get('galleryID')
          this.galleryService.getSpecificGallery(galleryID).subscribe((gallery: Gallery) => {
            this.gallery = gallery
            // Naravno potreban je i uslov if(this.viewImageService.componentRef) jer ako on nije zadovoljen, to znaci da se radi o slucaju da ti ni neces da gledas pojedinacnu sliku nego samo galeriju.
            if(this.viewImageService.componentRef){
              // U SVAKOM SLUCAJU VAZNO JE DA PRI KREIRANJU VIEW IMAGE KOMPONENTE DA SE GALERIJA UVEK POSLEDNJA SETUJE, JER SE (UNUTAR VIEW IMAGE KOMPONENTE) POMOCU NJE DOLAZI DO SLIKE I OSTALIH PODATAKA!
              this.viewImageService.setGallery(this.gallery)
            }
            this.commentsArrayReversed = gallery.comments.slice().reverse() //prvobitno pravljen pipe, al sam onda premestio reverse (pravljenje da ti niz bude u obrnutom redosledu) ovde, vidi odgovor od Thierry Templier https://stackoverflow.com/questions/35703258/invert-angular-2-ngfor

            // console.log(this.commentsArrayReversed);
            // console.log(gallery);
          }, (err: HttpErrorResponse) => {
            alert(`Server returned code ${err.status} with message: ${err.error.message}`);
            console.log(err)
          })
      }
  		
  	})

  }
 

  public resizeImageIfVertical($event){
    // console.log($event.target.parentElement);
    // kako dobaviti dimenzije slike https://davidwalsh.name/get-image-dimensions
    /*if (($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.5) {
      $event.path[1].style.width = '50%'
    } else if(($event.path[0].naturalHeight / $event.path[0].naturalWidth) >= 1.2){
      $event.path[1].style.width = '65%'
    }*/

    // U mozilli npr nemas ova path sranja kao gore, ali umesto toga mozes koristiti target za path[0], a target.parentElement ili target.parentNode za path[1]
    if (($event.target.naturalHeight / $event.target.naturalWidth) >= 1.5) {
      $event.target.parentNode.style.width = '50%'
    } else if(($event.target.naturalHeight / $event.target.naturalWidth) >= 1.2){
      $event.target.parentNode.style.width = '65%'
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
