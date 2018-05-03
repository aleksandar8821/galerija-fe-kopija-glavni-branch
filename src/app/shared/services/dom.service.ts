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


@Injectable()
export class DomService {

	public addedImagesArray: Array<any> = []
	public createdComponentsArray: Array<ComponentRef<any>> = []
	private vcRef: ViewContainerRef
	  
  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private appRef: ApplicationRef,
      private injector: Injector
  ) { }
  
  setViewContainerRef(vcRef: ViewContainerRef){
  	this.vcRef = vcRef
  }
  
  addDynamicComponent(component: any) {

    // 1. Create a component reference from the component 
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);
    //Prosledjujem referencu na komponentu samoj kreiranoj komponenti preko inputa (prosledjujem joj referencu na sebe zapravo, jer mislim da referencu na nju u vidu ComponentRef ne moze da dobije unutar sebe, jedino valjda ovako -> ovaj pristup nasao na linku https://medium.com/@caroso1222/angular-pro-tip-how-to-dynamically-create-components-in-body-ba200cc289e6 u komentaru od Emin Sinani):
    (<any>componentRef.instance).componentReference = componentRef; //PS PAZI, kad imas ovo (<any u prethodni red MORAS staviti tacku zarez na kraj, jer inace javlja neku gresku!!!
    // Na ovaj nacin se stavlja output na komponentu koja je dinamicki kreirana:
    (<any>componentRef.instance).imageData.subscribe(dataPackage => {
    	dataPackage.positionIndex = this.vcRef.indexOf(dataPackage.componentRef.hostView);

    	this.addedImagesArray.push(dataPackage)
    })

    this.createdComponentsArray.push(componentRef)

    this.vcRef.insert(componentRef.hostView)

    // const currentIndex = this.vcRef.indexOf(componentRef.hostView);
    // const len = this.vcRef.length;

    // console.log(this.vcRef);
    // console.log(currentIndex);
    // console.log(len);

    console.log(this.createdComponentsArray);

  }

  // ideju za ovo nasao na ovom odlicnom linku https://stackoverflow.com/questions/47915236/angular-5-rearrange-dynamically-created-components <<< demo https://stackblitz.com/edit/angular-wxnsjh (downloadovano - file: angular-wxnsjh)
  move(shift: number, componentRef: ComponentRef<any>) {
      const currentIndex = this.vcRef.indexOf(componentRef.hostView);
      const len = this.vcRef.length;

      let destinationIndex = currentIndex + shift;
      if (destinationIndex === len) {
        destinationIndex = 0;
      }
      if (destinationIndex === -1) {
        destinationIndex = len - 1;
      }

      this.vcRef.move(componentRef.hostView, destinationIndex);
    }


  getData(){
    // Ako je prethodno kreirana galerija i npr. validacija na serveru nije prosla, tebi ce ostati stranica za kreiranje ucitana, a ujedno ce i stari podaci ostati sacuvani u this.addedImagesArray sto naravno nije pozeljno. Zato sad pri svakom novom pozivu ove funkcije brisem stare podatke:
    this.addedImagesArray = []

  	this.createdComponentsArray.forEach((component: ComponentRef<any>) => {
      // Preko ove komande saljem svim kreiranim addImage komponentama, da posalju svoje podatke preko outputa, a podaci ce biti uhvaceni gore gde sam definisao imageData output:
  		component.instance.sendImageData() //Da, ovde mi je bilo malko zajebano da shvatim da li je ovo pravilan pristup, u smislu da li ce moj kod cekati da se svi podaci iz svih komponenti smeste u addedImagesArray i da tek onda vraca Observable od njega. Pre svega da kazem da sam testirao ovo tako sto sam ubacio funkciju koja traje duzi vremenski period - recimo neki pandam funkciji sleep u javi (imas objasnjenje za ovo u fajlu javascript, trazi samo funkciju sleep). Test je prosao i funkcija je odradila uspesno ono sto je trebala.I tu sam zapravo na kraju skontao prostu stvar (za koju sam valjda skroz u pravu, nisam skroz siguran) a to je sledece: ovaj kod poziva funkciju sendImageData() - dok se ta funkcija ne izvrsi, odnosno dok se njen execution context ne zatvori, ovaj kod nece ici dalje; zatim ta funkcija radi emit() koja je opet funkcija i koja i dalje drzi ovaj prvobitni execution context otvorenim. Ona ocigledno po onom sto sam ja testirao ceka da se kod definisan u output-u zavrsi i tek kad se to zavrsi ovaj prvobitni execution context se zavrsava i kod moze nastaviti dalje. Eto, tako ja to vidim i msm da sam u pravu. 
  	})


  	// Nasao funkciju za sortiranje niza objekata na https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort , (samo ukucaj u find Objects can be sorted given the value of one of their properties.):
  	this.addedImagesArray.sort(function (a, b) {
		  return a.positionIndex - b.positionIndex;
		});

  	return Observable.of(this.addedImagesArray)

  }

  destroyComponent(componentRef: ComponentRef<any>){
    let indexVcRef = this.vcRef.indexOf(componentRef.hostView)
    this.vcRef.remove(indexVcRef) //msm da sam ovo skontao iz dokumentacije zvanicne kako se radi, nznm, msm da to nisam nasao u onim tutorijalima, nisam siguran
    let indexCreatedComponentsArray = this.createdComponentsArray.indexOf(componentRef)
    // Ovaj splice metod ima neke 'kontroverze' doduse, mada mislim da meni ovde nece praviti problem (vidi https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value , https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript i sl.)
    if(indexCreatedComponentsArray !== -1){
      this.createdComponentsArray.splice(indexCreatedComponentsArray, 1)
    }
    
    componentRef.destroy() // ovo svaki tutorijal kaze da treba da se destroyuje ovako...
    componentRef = null; // ovo da stavlja na null sam nasao ovde https://medium.com/@DenysVuika/dynamic-content-in-angular-2-3c85023d9c36 <<< gledaj u ngOnDestroy
  }

}
