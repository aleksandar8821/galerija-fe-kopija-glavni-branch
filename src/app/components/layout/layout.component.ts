import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router, Event, NavigationStart } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  @ViewChild('navigation') navigation: ElementRef
  @ViewChild('btnNavBarToggler') btnNavBarToggler: ElementRef
  @ViewChild('collapsingNavBarDiv') collapsingNavBarDiv: ElementRef

  // S ovim postizem da kad mi je hamburger menu navigacija otvorena, a ja kliknem negde van nje da se ona tada zatvori!
  @HostListener('body:click', ['$event'])
  closeNavbarOnClickOutside(event){
    // console.log(event);
    // Ovde prvo ispitujem da li mi je hamburger menu uopste otvoren, a to saznajem ako on sadrzi klasu show. U vanilla js-u se to radi sa ovim classList.contains() (https://stackoverflow.com/questions/5085567/what-is-the-hasclass-function-with-plain-javascript - vidi odgovor ispod prihvacenog od Damien) ili mozes da uradis ovo iz prihvacenog odgovora sa istog linka (da imitiras jquery hasClass metodu) ukoliko te je briga za neke matorije browsere. Ovde imas opet skoro iste odgovore https://stackoverflow.com/questions/5898656/test-if-an-element-contains-a-class .
    // Zatim ispitujem da li mesto gde sam kliknuo pripada navigaciji, odnosno da li navigacija sadrzi (contains) to mesto. Ovo se danas ovako radi u vanilla js-u sa Node.contains() (https://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-contained-within-another - vidi odgovor ispod prihvacenog, mozes gledati i sve ostale odgovore ima dobrih, ali pored ovog jos bih odabrao ovaj od Josh Crozier koji koristi parent.querySelector()). Link na istu temu: https://stackoverflow.com/questions/34621987/check-if-clicked-element-is-descendant-of-parent-otherwise-remove-parent-elemen . PS verujem da se ovo moze raditi i sa https://developer.mozilla.org/en-US/docs/Web/API/Element/closest verovatno i sa https://angular.io/api/core/Renderer2#selectRootElement , ali ova dva nisam testirao.
    if (this.collapsingNavBarDiv.nativeElement.classList.contains('show') && !this.navigation.nativeElement.contains(event.target)){
      // Ovde koristim foru koja je po meni najjednostavnija. Umesto da istrazujem koje se sve klase dodaju da bi se navigacija zatvorila jednostavno simuliram klik na dugme za navigaciju koje i inace zatvara navigaciju (nasao na https://stackoverflow.com/questions/23764863/how-to-close-an-open-collapsed-navbar-when-clicking-outside-of-the-navbar-elemen/23769601#23769601 , https://stackoverflow.com/questions/41494858/closing-an-open-collapsed-navbar-when-clicking-outside-in-booststrap-4). Jos neki korisni odgovori ovde https://stackoverflow.com/questions/42401606/how-to-hide-collapsible-bootstrap-4-navbar-on-click
      this.btnNavBarToggler.nativeElement.click()
    }
  }

	// ovo sto si injektirao authService u ovu komponentu ti omogucuje da pristupis metodama i propertijima authService-a
  constructor(private authService: AuthService, private router: Router) {

    // Na ovaj nacin se detektuju promene rute (https://medium.com/@Carmichaelize/detecting-router-changes-with-angular-2-2f8c019788c3)
  	router.events.subscribe((event: Event) => {
      // Na ovaj nacin postizem da mi se hamburger menu navigacija zatvara ukoliko kliknem na neki link unutar nje. Zasto radim ovako, a ne slusam jednostavno click event na linku? Zato sto linkovi rade preko routerLink direktive (atributa sta li je) i kad bi jos dodatno dodao click event koji zatvara navigaciju ne znam koji bi se prvi okinuo i dal bi dolazili u neki konflikt. Plus ovako ako klikces na link na kojem se vec nalazis nece ti se zatvoriti navigacija. Etoooooooooooooo
      if(event instanceof NavigationStart && this.collapsingNavBarDiv.nativeElement.classList.contains('show')){
        this.btnNavBarToggler.nativeElement.click()
      }
    })
  }

  ngOnInit() {
  	
  }

  public onActivate(event){
    // Ipak sam ovo za sad zakomentarisao, iako je perfektno radilo, ali onda nemas utisak SPA kad ti se non stop stranica penje na gore, tako da cu samo staviti ovo ponasanje na home stranicu
    // window.scroll(0,0);
  }

}
