import { User } from '../../shared/models/user';
import { Image } from '../../shared/models/image'; 

export class ImageComment {
	constructor(
		public id?: number,
		public commentBody?: string,
		public userId?: number,
 		public user?: User,
		public imageId?: number,
 		public image?: Image,
 		public createdAt?: string,
 		public updatedAt?: string,

	){}
}
