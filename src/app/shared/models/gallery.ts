import { User } from '../../shared/models/user'; 
import { Image } from '../../shared/models/image'; 


export class Gallery {

	constructor(

		public id?: number,
		public name?: string,
		public description?: string,
		public user_id?: number,
 		public created_at?: string,
 		public updated_at?: string,
 		public user?: User,
		public images: Array<Image> = []

	){

	}

}
