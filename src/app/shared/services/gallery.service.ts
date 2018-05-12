import { Injectable } from '@angular/core';
import { Observer, Observable } from 'rxjs';
import { Gallery } from '../../shared/models/gallery';
import { GalleryComment } from '../../shared/models/gallery-comment';
import { Image } from '../../shared/models/image';
import { ImageComment } from '../../shared/models/image-comment';
import { User } from '../../shared/models/user';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GalleryService {

	// moras ga inicijalizovati, jer inace nece moci da nadje push metodu na njemu!
	private galleries: Array<Gallery> = []
	// private specificGallery: Gallery //mozda je pametnije da ga ne lepis ovde, nego da napravis promenljivu unutar funkcije, onda mozda ne bi morao ovako da je reinicijalizujes na pocetku ko sto radis u getGalleries()

  constructor(private http: HttpClient, private authService: AuthService) { }

	public getGalleries()
	  {
	  	// desava se da ostanu stari rezultati, pa onda kad dobavi nove sabiraju se i duplaju i ne prikazuju kako treba, i to se sabiraju ovde u servisu a ne u komponenti!
	  	this.galleries = []
	    return new Observable((o: Observer<any>) => {
	      this.http.get('http://localhost:8000/api/galleries')
	        .subscribe(
	          (galleries: any[]) => {
	            galleries.forEach((g) => {

	            	// let showedImagesNumber = this.setShowedImagesNumber(g)

	              this.galleries.push(new Gallery(g.id, g.name, g.description, g.user_id, g.created_at, g.updated_at, new User(g.user.id, g.user.first_name, g.user.last_name, g.user.email), g.images, g.comments/*, showedImagesNumber*/));
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

/*Odustajem od ovoga, jer izgleda malo blesavo, ali bar je bio uspesan pristup, pa ko zna, mozda ti jednog dana zatreba...
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
				}else{
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
*/
		public getSpecificGallery(id){

			/*Ovo se ne moze ovako raditi da ti samo ovo u funkciji stoji jer da bi se na ovu funkciju getSpecificGallery(id) neko subscribeovao, ona mora da vraca Observable, a u ovom slucaju ne vraca ona nego ova get metoda, tako da, kolko ja kontam iz ovoga, ovo sa Observable.of se moze koristiti jedino ako podaci koje mu prosledjujes nisu opet zavisni od nekog subscribe-a ko sto ovde jesu zavisni (MADA BI TI NAJVEROVATNIJE RADILO DA SAMO STAVIS RETURN ISPRED OVOG this.http.get KO STO JE RADJENO OVDE https://gitlab.com/vivify-ideas/vivify-academy-angular/blob/master/src/app/shared/services/contacts.service.ts):
			this.http.get('http://localhost:8000/api/galleries/' + id).subscribe((gallery: any) => {
				let fetchedGallery = new Gallery(gallery.id, gallery.name, gallery.description, gallery.user_id, gallery.created_at, gallery.updated_at, gallery.user, gallery.images)

				return Observable.of(fetchedGallery)
			})*/

	    return new Observable((o: Observer<any>) => {
	      this.http.get('http://localhost:8000/api/galleries/' + id)
	        .subscribe(
	          (gallery: any) => {
	            
	          	let fetchedGallery = new Gallery(gallery.id, gallery.name, gallery.description, gallery.user_id, gallery.created_at, gallery.updated_at, gallery.user, gallery.images, gallery.comments)

	            // ovaj o.next bi po meni definitivno trebalo da ide ovde, ti si u onoj verziji koju si slao vivify-u, ovo stavljao skroz van subscribe-a i to je nekako funkcionisalo, ni ne zanima me kako, al msm da bi ovako trebalo da se radi
	            o.next(fetchedGallery);
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


		public addGalleryComment(galleryComment: GalleryComment, gallery: Gallery){
			
			return new Observable((o: Observer<any>) => {
			  this.http.post('http://127.0.0.1:8000/api/gallery_comment', {
  				'comment_body': galleryComment.commentBody,
  				'gallery_id': gallery.id
  			}, {
  				headers: this.authService.getRequestHeaders()
  			}).subscribe((storedComment: GalleryComment) => {
  				o.next(storedComment)
  				return o.complete()
  			}, (error: HttpErrorResponse) => {
  				o.error(error)
  				return o.complete()
  			})
			});

		}


		public deleteGalleryComment(comment: GalleryComment){
			return new Observable((o: Observer<any>) => {
			  this.http.delete('http://127.0.0.1:8000/api/gallery_comment/' + comment.id, {
  				headers: this.authService.getRequestHeaders()
  			}).subscribe((deletedComment: GalleryComment) => {
  				o.next(deletedComment)
  				return o.complete()
  			}, (error: HttpErrorResponse) => {
  				o.error(error)
  				return o.complete();
  			})
			});
		}


		public addImageComment(imageComment: ImageComment, image: Image){
			
			return new Observable((o: Observer<any>) => {
			  this.http.post('http://127.0.0.1:8000/api/image_comment', {
  				'comment_body': imageComment.commentBody,
  				'image_id': image.id
  			}, {
  				headers: this.authService.getRequestHeaders()
  			}).subscribe((data: { storedComment: ImageComment, gallery: Gallery}) => {
  				o.next(data)
  				return o.complete()
  			}, (error: HttpErrorResponse) => {
  				o.error(error)
  				return o.complete()
  			})
			});

		}


		public deleteImageComment(comment: ImageComment){
			return new Observable((o: Observer<any>) => {
			  this.http.delete('http://127.0.0.1:8000/api/image_comment/' + comment.id, {
  				headers: this.authService.getRequestHeaders()
  			}).subscribe((gallery: Gallery) => {
  				o.next(gallery)
  				return o.complete()
  			}, (error: HttpErrorResponse) => {
  				o.error(error)
  				return o.complete();
  			})
			});
		}

}
