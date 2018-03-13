import { Injectable } from '@angular/core';
import { Observer, Observable } from 'rxjs';
import { Gallery } from '../../shared/models/gallery';
import { User } from '../../shared/models/user';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GalleryService {

	// moras ga inicijalizovati, jer inace nece moci da nadje push metodu na njemu!
	private galleries: Array<Gallery> = []

  constructor(private http: HttpClient) { }

	public getGalleries()
	  {
	  	// desava se da ostanu stari rezultati, pa onda kad dobavi nove sabiraju se i duplaju i ne prikazuju kako treba, i to se sabiraju ovde u servisu a ne u komponenti!
	  	this.galleries = []
	    return new Observable((o: Observer<any>) => {
	      this.http.get('http://localhost:8000/api/galleries')
	        .subscribe(
	          (galleries: any[]) => {
	            galleries.forEach((g) => {

	            	let showedImagesNumber = this.setShowedImagesNumber(g)

	            	// let firstRow:number = 0
	            	// let secondRow:number = 0
	            	// let thisImagePercentWidth:number = 0
	            	// let showedImagesNumber:number = 0

	            	// for (var i = 0; i < 12; i++) {
	            	// 	if(i === g.images.length){
	            	// 		break
	            	// 	}

	            	// 	if (g.images[i].vertical === 1) {
	            	// 		thisImagePercentWidth = 15
	            	// 	}else if(g.images[i].vertical === 0){
	            	// 		thisImagePercentWidth = 30
	            	// 	}


	            	// 	// ovde moram staviti i ovaj uslov da je drugi red na nuli, jer se moze desiti situacija da imas u prvom redu 30 + 30 + 15, pa sledeci koji ti nailazi je 30 i prvi uslov ti nije zadovoljen i slika prelazi u drugi red. Ako je ovaj sto ide posle njega 15, da nije ovog uslova, on bi bio dodat u prvi red, sto je u realnoj situaciji nemoguce. Dakle, cim drugi red dobije prvu sliku, prvi je zatvoren za dalje dodavanje - to govori ovaj uslov(secondRow === 0):
	            	// 	if ((firstRow + thisImagePercentWidth <= 90) && secondRow === 0) {
	            	// 		firstRow += thisImagePercentWidth
	            	// 	}else if(secondRow + thisImagePercentWidth < 90){
	            	// 		secondRow += thisImagePercentWidth
	            	// 	}else if(secondRow + thisImagePercentWidth === 90){
	            	// 		showedImagesNumber = i + 1
	            	// 		break
	            	// 	}else if(secondRow + thisImagePercentWidth > 90){
	            	// 		showedImagesNumber = i
	            	// 		break
	            	// 	}

	            	// 	showedImagesNumber = i + 1
	            		
	            	// }

	              this.galleries.push(new Gallery(g.id, g.name, g.description, g.user_id, g.created_at, g.updated_at, new User(g.user.id, g.user.first_name, g.user.last_name, g.user.email), g.images, showedImagesNumber));
	            });
	            // ovaj o.next bi po meni definitivno trebalo da ide ovde, ti si u onoj verziji koju si slao vivify-u, ovo stavljao skroz van subscribe-a i to je nekako funkcionisalo, ni ne zanima me kako, al msm da bi ovako trebalo da se radi
	            o.next(this.galleries);
	            return o.complete();
	          },
	          (err: HttpErrorResponse) => {
	          	o.error(err)
	          	// ne znam dal ovaj o.complete treba i ovde da ide, ovi iz vivify sam video da su radili samo sa return o.error(err) i bukvalno nista vise https://gitlab.com/vivify-ideas/vivifyacademy-api-fe/blob/master/src/app/shared/services/auth.service.ts
	          	return o.complete();
	          }

          );	
          // Ova dva su ti ranije ovde stajala, msm da to nema logike, bar bi trebalo da nema, mada je radilo, jedino u tom slucaju se UOPSTE nije okidao error handler kad na backendu postoji greska!!!
	            // o.next(this.galleries);	           
	            // return o.complete();
      });

		}


		public setShowedImagesNumber(gallery){
			let firstRow:number = 0
			let secondRow:number = 0
			let thisImagePercentWidth:number = 0
			let showedImagesNumber:number = 0

			for (var i = 0; i < 12; i++) {
				if(i === gallery.images.length){
					break
				}

				if (gallery.images[i].vertical === 1) {
					thisImagePercentWidth = 15
				}else if(gallery.images[i].vertical === 0){
					thisImagePercentWidth = 30
				}


				// ovde moram staviti i ovaj uslov da je drugi red na nuli, jer se moze desiti situacija da imas u prvom redu 30 + 30 + 15, pa sledeci koji ti nailazi je 30 i prvi uslov ti nije zadovoljen i slika prelazi u drugi red. Ako je ovaj sto ide posle njega 15, da nije ovog uslova, on bi bio dodat u prvi red, sto je u realnoj situaciji nemoguce. Dakle, cim drugi red dobije prvu sliku, prvi je zatvoren za dalje dodavanje, odnosno dodaj sliku u prvi red jedino ako u drugi red jos nisi nista krenuo da dodajes - to govori ovaj uslov(secondRow === 0):
				if ((firstRow + thisImagePercentWidth <= 90) && secondRow === 0) {
					firstRow += thisImagePercentWidth
				}else if(secondRow + thisImagePercentWidth < 90){
					secondRow += thisImagePercentWidth
				}else if(secondRow + thisImagePercentWidth === 90){
					showedImagesNumber = i + 1
					break
				}else if(secondRow + thisImagePercentWidth > 90){
					showedImagesNumber = i
					break
				}

				showedImagesNumber = i + 1
				
			}

			return showedImagesNumber
		}

}
