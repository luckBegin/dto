import {forkJoin, Observable} from "./Observable.class";
import {FormGroup} from "./FormGroup";

export class FormArray extends Observable{
	controls = [] ;
	_valid ;

	constructor(data) {
		super()
		this._init(data);
	}

	_init( data ) {
		if( !data instanceof Array ) throw new Error("arguments must be an array" ) ;

		data.forEach( item => {
			if( item instanceof FormGroup ) {
				this._initWithFormGroup( item )
			}else {
				this._initWithControl( item )
			}
		});

		this._subscription() ;
	}

	_initWithFormGroup( group ) {
		this.controls.push( group ) ;
	}

	_initWithControl( control ) {
		const group = new FormGroup( control ) ;
		this.controls.push( group ) ;
	}

	_subscription() {
		forkJoin( this.controls )
			.map( ({ event , value }) => { return { event , value } })
			.subscribe( res => {
				const { event } = res ;
				this.validation() ;
				this.next({
					event ,
					value: this.value ,
					valid: this._valid
				}) ;
			} , err => {
				this.error( err ) ;
			})
	}

	at(idx) {
		return this.controls[idx];
	}

	add(data) {

		if( data instanceof Array ) {
			data.forEach( item => {
				this.controls.push( new FormGroup( item )) ;
			})
		} else if ( data instanceof FormGroup) {
			this.controls.push( data ) ;
		} else {
			this.controls.push(new FormGroup(data));
		}

		this._subscription() ;

		this.validation() ;
	}

	validation() {
		const results = [] ;
		this.controls.forEach( (controlName , idx) => {
			const group = this.at( idx ) ;
			results.push( group.valid ) ;
		});

		const hasFalse = results.indexOf( false ) ;
		this._valid = !~hasFalse;

		return this._valid ;
	}

	remove(idx) {
		this.controls.splice(idx, 1);
		this.validate() ;
	}

	reset() {
		this.controls = [] ;
		this.validate() ;
	}

	patchValue( data ) {
		data.forEach( ( item,idx ) => {
			const control = this.at( idx ) ;
			if( control )
				control.patchValue( item ) ;
		});

		this.validate() ;
	}

	get valid() {
		return this._valid ;
	}

	get value () {
		let data = null ;

		Object.keys( this.controls).forEach( key => {
			const val = Reflect.get(this.controls,key).value ;
			( data || ( data = [] ) ).push( val ) ;
		});

		return data ;
	}
}
