export class User {
			 
	 	constructor(
	    public id?: number,
	    public firstName?: string,
	    public lastName?: string,
	    public email?: string,
	    public profileImage?: string,
	    public password?: string,
	    public confirmPassword?: string,
	    public acceptedTerms?: boolean,
	    public verified?: boolean,
	    public verifyToken?: string
 		 ) { }

}
