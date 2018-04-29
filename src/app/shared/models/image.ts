import { Gallery } from '../../shared/models/gallery'; 
import { ImageComment } from '../../shared/models/image-comment'; 

export class Image {

	constructor(

		public id?: number,
		public url?: string,
		public description?: string,
		public vertical?: number,
		public galleryId?: number,
		public gallery?: Gallery,
		public comments?: Array<ImageComment>

	){

	}

}
