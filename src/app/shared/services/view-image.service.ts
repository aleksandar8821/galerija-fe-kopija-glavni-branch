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
import { Gallery } from '../../shared/models/gallery'; 


@Injectable()
export class ViewImageService {

	private vcRef: ViewContainerRef
	private gallery: Gallery
	private galleryID: string
	private imageID: string

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
      private injector: Injector) { }

  setViewContainerRef(vcRef: ViewContainerRef){
  	this.vcRef = vcRef
  }

  setGallery(gallery: Gallery){
  	this.gallery = gallery
  }

  setGalleryID(galleryID: string){
  	this.galleryID = galleryID
  }

  setImageID(imageID: string){
  	this.imageID = imageID
  }

  addDynamicComponent(component: any) {

    // 1. Create a component reference from the component 
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);

    (<any>componentRef.instance).componentReference = componentRef;
    (<any>componentRef.instance).gallery = this.gallery;
    (<any>componentRef.instance).galleryID = this.galleryID;
    (<any>componentRef.instance).imageID = this.imageID;

    this.vcRef.insert(componentRef.hostView)

  }

}
