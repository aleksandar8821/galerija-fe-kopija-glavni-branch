import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Gallery } from '../../shared/models/gallery'; 
import { GalleryComment } from '../../shared/models/gallery-comment'; 
import { GalleryService } from '../../shared/services/gallery.service';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';


@Component({
  selector: 'app-view-gallery',
  templateUrl: './view-gallery.component.html',
  styleUrls: ['./view-gallery.component.css']
})
export class ViewGalleryComponent implements OnInit {

  public gallery: Gallery
  public commentsArrayReversed: Array<GalleryComment>
  public galleryComment: GalleryComment = new GalleryComment()
  public isUserAuthenticated: boolean
  public loggedUserEmail: string
  @ViewChild("progressBar") progressBar: ElementRef
  @ViewChild("btnAddComment") btnAddComment: ElementRef
  @ViewChild("disabledOverlay") disabledOverlay: ElementRef

  constructor(private galleryService: GalleryService, private route: ActivatedRoute, private renderer: Renderer2) {
    this.isUserAuthenticated = Boolean(window.localStorage.getItem('loginToken')); 
    this.loggedUserEmail = window.localStorage.getItem('loggedUserEmail')
  }

  ngOnInit() {
  	// bar po ovom (https://scotch.io/tutorials/handling-route-parameters-in-angular-v2) ovo bi moralo da se radi preko paramMap, jer on vraca Observable, ma pogledaj link samo
  	this.route.paramMap.subscribe(params => {
  		let id = params.get('id')
  		this.galleryService.getSpecificGallery(id).subscribe((gallery: Gallery) => {
        this.gallery = gallery
        this.commentsArrayReversed = gallery.comments.slice().reverse()
        // console.log(this.commentsArrayReversed);
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
   this.showLoaderDisablePageElements(true)

    this.galleryService.addGalleryComment(this.galleryComment, this.gallery).subscribe((storedComment: GalleryComment) => {
      this.commentsArrayReversed.unshift(storedComment)

      this.showLoaderDisablePageElements(false)
    }, (error: HttpErrorResponse) => {
      this.showLoaderDisablePageElements(false)

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

    if(confirm('Are you sure you want to delete this comment?')){

      this.showLoaderDisablePageElements(true)
      // console.log(comment);
      this.galleryService.deleteGalleryComment(comment).subscribe((deletedComment: GalleryComment) => {
        console.log(comment);
        // ovaj indexOf nije hteo da funkcionise kad bi vracao obrisan komentar sa backenda iako bi rekao da su ta dva objekta identicna, sa ovim comment funkcionise...
        let indexCommentsArrayReversed = this.commentsArrayReversed.indexOf(comment)
        // console.log(indexCommentsArrayReversed);
        // Ovaj splice metod ima neke 'kontroverze' doduse, mada mislim da meni ovde nece praviti problem (vidi https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value , https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript i sl.)
        if(indexCommentsArrayReversed !== -1){
          this.commentsArrayReversed.splice(indexCommentsArrayReversed, 1)
        }

        this.showLoaderDisablePageElements(false)
      }, (error: HttpErrorResponse) => {
        this.showLoaderDisablePageElements(false)

        alert(error.error.error)
      })

    }

    
  }

 
  public showLoaderDisablePageElements(show: boolean){
    if(show === true){
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'visible')
      this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'visible')
      this.renderer.setProperty(this.btnAddComment.nativeElement, 'disabled', true)
    }else{
      this.renderer.setStyle(this.progressBar.nativeElement, 'visibility', 'hidden')
      this.renderer.setStyle(this.disabledOverlay.nativeElement, 'visibility', 'hidden')
      this.renderer.setProperty(this.btnAddComment.nativeElement, 'disabled', false)
    }
  }


}
