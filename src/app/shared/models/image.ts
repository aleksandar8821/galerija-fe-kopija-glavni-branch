import { Gallery } from '../../shared/models/gallery'; 

export class Image {

	constructor(

		public id?: number,
		public url?: string,
		public galleryId?: number,
		public gallery?: Gallery

	){

	}

}
