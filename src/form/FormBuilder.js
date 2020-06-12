import {FormGroup} from "./FormGroup";
import {FormArray} from "./FormArray";

export class FormBuilder {
	static group( config ) {
		return new FormGroup( config ) ;
	}

	static array( config ) {
		return new FormArray( config ) ;
	}
}
