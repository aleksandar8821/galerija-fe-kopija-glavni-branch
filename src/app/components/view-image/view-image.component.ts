import { Component, OnInit, Input, ComponentRef, Renderer2, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Gallery } from '../../shared/models/gallery';
import { Image } from '../../shared/models/image';
import { ImageComment } from '../../shared/models/image-comment';
import { ViewImageService } from '../../shared/services/view-image.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.css']
})
export class ViewImageComponent implements OnInit, OnDestroy {

	private _imageID: number
	private _gallery: Gallery
	private galleryID: number
	private showingImage: Image
	private commentsArrayReversed: Array<ImageComment>


	@Input() componentReference: ComponentRef<any>
	// @Input() imageID: string
	@Input() set imageID(imageID: string){
		this._imageID = parseInt(imageID)
		if(this._gallery){
			this.showingImage = this._gallery.images.find(image => image.id === this._imageID)
		}
	}
	@Input() set gallery(gallery: Gallery){
		this._gallery = gallery
		this.galleryID = gallery.id
		this.showingImage = this._gallery.images.find(image => image.id === this._imageID)
	}

  constructor(private route: ActivatedRoute, private router: Router, private viewImageService: ViewImageService, private renderer: Renderer2) { }

  ngOnInit() {
  	// console.log(this._gallery);
  	// console.log(this.componentReference);
  	// console.log(this._imageID);

  	// Pomocu ovoga se postize da se moze skrolovati samo ova komponenta, a pozadina da ne moze https://stackoverflow.com/questions/31906059/absolute-positioned-div-prevent-background-scroll?rq=1 . Inace ako hoces preko renderer-a da radis, moras raditi na ovaj nacin, tj. moras da napises document.body kao prvi argument funkcije, jer body ne mozes da targetiras preko ViewChild (vidi sta kaze Günter Zöchbauer https://stackoverflow.com/questions/39971762/add-class-to-body-on-angular2). Kao sto vidis na prethodnom linku koristi se fora da u glavnoj app komponenti podesis da ti njen selektor bude body tag umesto app-root taga, pa da onda koristis HostBinding kako bi stilizovao body. Ja to nisam hteo da radim, jer mi deluje prilicno hacky, pa sam koristio renderer na ovu foru, sto sam pokupio ovde https://stackoverflow.com/questions/43542373/angular2-add-class-to-body-tag , e sad da li je ovo saglasno pravilima angular dom manipulacije, to bas i ne znam, al na ovom linku niko ne spominje da nije saglasno (zapravo spominje se: "This won't work server-side as there's no document there." - mgol. Pa sad ako ti treba server side rendering, onda radi onako da stavljas body selektor u app komponentu... Imas to i na ovom linku https://stackoverflow.com/questions/39971762/add-class-to-body-on-angular2 i ovom https://stackoverflow.com/questions/34430666/angular-2-x-bind-class-on-body-tag/34430979#34430979, https://stackoverflow.com/questions/34636661/how-do-i-change-the-body-class-via-a-typescript-class-angular2/34637039#34637039, https://stackoverflow.com/questions/34881401/style-html-body-from-web-component-angular-2/34892496#34892496 i jos kolko oces mesta...)
  	this.renderer.setStyle(document.body, 'overflow', 'hidden')
  }

  public nextImage(){
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

  public closeImage(){
  	this.router.navigateByUrl('/galleries/' + this.galleryID);
  	this.viewImageService.destroyComponent(this.componentReference)
  }

  ngOnDestroy(){
  	this.renderer.setStyle(document.body, 'overflow', 'visible') //visible je default vrednost https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
  }


}
