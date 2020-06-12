import { Observable } from  './Observable.class';

const throttle = ( fn, wait ) => {
	let timer = null;
	return function(){
		const context = this;
		const args = arguments;
		if(!timer){
			timer = setTimeout(function(){
				fn.apply(context,args);
				timer = null;
			}, wait )
		}
	}
};

export class FormControl  extends Observable{
	_value = '' ;

	valid ;

	name ;

	validators = [] ;

	dirty = false ;

	constructor(val , validators , field ) {
		super() ;

		this._value = val ;

		if( validators instanceof Array ) this.validators = validators ;

		if( typeof name === 'string') this.name = field ;

		this.validation() ;
	}

	validation() {
		this.valid = false ;
		Promise.all( this.validators.map( item => item(this) ) )
			.then( res => {

				const hasFalse = res.indexOf(false) ;

				this.valid = !~hasFalse;

				this.next({
					key: this.name ,
					valid: this.valid ,
					value: this._value ,
					event: 'update' ,
				});
			})
			.catch( e => {
				throw  new Error('invalid validator with ' + e ) ;
			})
	}

	reset() {
		this._value = '' ;
		this.dirty = false ;
		this.validation() ;
	}

	patchValue( val ) {
		this._value = val ;
		this.dirty = false ;
		this.validation() ;
	}

	get value() {
		return this._value ;
	}

	set value( val ) {
		if(val === '') {
			this.dirty = false ;
			this._value = val ;
			this.validation() ;
		} else {
			this._value = val ;
			this.dirty = true ;
			this.validation();
		}
	}
}
