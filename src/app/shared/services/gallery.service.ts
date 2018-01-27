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
	    return new Observable((o: Observer<any>) => {
	      this.http.get('http://localhost:8000/api/galleries')
	        .subscribe(
	          (galleries: any[]) => {
	            galleries.forEach((g) => {
	              this.galleries.push(new Gallery(g.id, g.name, g.description, g.user_id, g.created_at, g.updated_at, new User(g.user.id, g.user.first_name, g.user.last_name, g.user.email), g.images));
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




}
