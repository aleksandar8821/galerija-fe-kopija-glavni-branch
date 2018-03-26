import { User } from '../../shared/models/user';
import { Gallery } from '../../shared/models/gallery'; 

export class GalleryComment {
	constructor(
		public id?: number,
		public commentBody?: string,
		public userId?: number,
 		public user?: User,
		public galleryId?: number,
 		public gallery?: Gallery,
 		public createdAt?: string,
 		public updatedAt?: string,

	){}
}
