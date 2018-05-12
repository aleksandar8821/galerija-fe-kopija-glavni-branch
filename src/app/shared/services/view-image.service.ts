import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ApplicationRef,
    ViewContainerRef,
    ComponentRef
} from '@angular/core';
import { Observable, Observer } from 'rxjs/Rx';
import { Subject } from 'rxjs';
import { Gallery } from '../../shared/models/gallery'; 


@Injectable()
export class ViewImageService {

	public componentRef: ComponentRef<any>;

	public vcRef: ViewContainerRef
	public imageID: string
	public gallery: Gallery

  // Koristim komunikaciju parenta i childa preko servisa kao i ovde https://angular.io/guide/component-interaction#parent-and-children-communicate-via-a-service
  private gallerySource = new Subject<Gallery>()
  public galleryUpdatedImageComments = this.gallerySource.asObservable()

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
      private injector: Injector) { }

  setViewContainerRef(vcRef: ViewContainerRef){
  	this.vcRef = vcRef
  }

  // Moram imat posebne setere za imageID i galeriju jer se oni ne setuju uvek pri kreiranju komponente
  setImageID(imageID: string){
  	this.imageID = imageID;
  	(<any>this.componentRef.instance).imageID = this.imageID;
  }

  setGallery(gallery: Gallery){
  	this.gallery = gallery;
  	(<any>this.componentRef.instance).gallery = this.gallery;
  }

  setGalleryUpdatedImageComments(galleryUpdatedImageComments: Gallery){
    this.gallerySource.next(galleryUpdatedImageComments)
  }


  addDynamicComponent(component: any) {

    // 1. Create a component reference from the component 
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);

    // Neku debilnu gresku resavam ovde tako sto stavim tacku zarez na kraj izraza, debilno al probaj ako budes imao neki problem ovde... Kolko sam skontao, problem je zapravo u sledecem redu koji pocinje sa (<any> , jer sam mi se isti ovaj problem pojavljivao ispred tog reda. Dakle u red iznad treba samo staviti tacku zarez
   	this.componentRef = componentRef;
    (<any>this.componentRef.instance).componentReference = componentRef;
    this.vcRef.insert(componentRef.hostView)

  }

  destroyComponent(componentRef: ComponentRef<any>){
    let indexVcRef = this.vcRef.indexOf(componentRef.hostView)
    this.vcRef.remove(indexVcRef) //msm da sam ovo skontao iz dokumentacije zvanicne kako se radi, nznm, msm da to nisam nasao u onim tutorijalima, nisam siguran
   
    
    componentRef.destroy() // ovo svaki tutorijal kaze da treba da se destroyuje ovako...
    componentRef = null; // ovo da stavlja na null sam nasao ovde https://medium.com/@DenysVuika/dynamic-content-in-angular-2-3c85023d9c36 <<< gledaj u ngOnDestroy


    this.componentRef = null // Bez ovoga nije hteo da mi odradi da ponovo otvorim sliku, kad bi je prethodno zatvorio
  }

}
