import {forkJoin, Observable} from './Observable.class';
import {FormControl} from "./FormControl";
import {FormArray} from "./FormArray";
export class FormGroup extends Observable{
	controls = {} ;
	valid ;
	invalidControl = null  ;

	constructor( form ) {
		super();
		if( !(form instanceof Object) ) throw new Error('非法的FormGroup配置') ;
		this._init(form)
	}

	_init( form ) {
		Object.keys( form ).forEach( key => {
			const item = Reflect.get( form , key) ;
			if( item instanceof FormArray ) {
				this.controls[key] = item ;
			} else {
				this._initWithFormControl( item , key) ;
			}
		});
		this.validation() ;
		this._subscription() ;
	}

	_initWithFormControl( item , key) {
		const formControl = new FormControl(
			item[0] ,
			item[1] ,
			key
		)
		Reflect.set(this.controls , key , formControl ) ;
	}

	validation() {
		let pass = true ;

		for ( let keys in this.controls ) {
			const control = this.get( keys ) ;
			if( !control.valid ) {
				pass = false ;
				this.invalidControl = control.name;
				break ;
			}
		}

		this.valid = pass ;

		return this.valid ;
	}

	reset( data ) {
		Object.keys( this.controls).forEach( controlName => {
			const control = this.get(controlName) ;
			control.reset() ;
			if( data && data.hasOwnProperty(controlName) ) {
				control.patchValue( data[ controlName ]) ;
			}
		});
		this.invalidControl = null ;
	}

	patchValue( data ) {
		Object.keys( data ).forEach( key => {
			if(this.controls.hasOwnProperty( key ) )
				this.get( key ).patchValue( data[key ] ) ;
		});
	}

	get( name ) {
		const control =Reflect.get( this.controls , name ) ;
		return control ? control : null ;
	}

	_subscription() {
		forkJoin( Object.keys( this.controls ).map( key => {
			return Reflect.get( this.controls, key ) ;
		}) )
			.subscribe( res => {
				let { event }  = res ;
				this.validation()
				this.next({
					event ,
					control : res ,
					value: this.value ,
					valid: this.valid
				});
			})
	}

	get value() {
		let value = null ;
		Object.keys( this.controls ).forEach(controlName => {
			const control = this.get( controlName ) ;
			const controlValue = control.value ;
			if( controlValue !== null && controlValue !== undefined && controlValue !== '' ) {
				( value === null ) && ( value = {} );
				value[controlName] = control.value ;
			}
		});
		return value ;
	}

	keys() {
		return Object.keys( this.controls ) ;
	}

	add( key , formControl ) {
		this.controls[key] = formControl ;
		this.validation() ;
	}

	getInvalidControl() {
		return this.invalidControl ;
	}
}
