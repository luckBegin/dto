import {Observable} from "./Observable.class";
import {Validator} from "./Validator";
import {FormBuilder} from "./FormBuilder";
import {FormControl} from "./FormControl";

export const DTO = ( target ) => {
	const proto = target.prototype ;

	 class DataTransportObject extends target {
	 	$message ;
	 	valid ;
	 	change$ ;

		constructor( $message ) {
			super();
			this.$message = $message ;
			this._init() ;
		}

		get value() {
			return this.form.value ;
		}

		validation() {
			if( !this.valid ) {
				const name = this.form.getInvalidControl() ;
				this.$message.warning( this.tips[name] || '请检测每项填写的数据是否正确' )
			}

			return this.valid ;
		}

		getForm() {
			return this.form ;
		}

		_init() {
			if(!this.form ) return void 0;
			this.form.keys().forEach( key => {
				const item = this.form.get(key) ;
				if( item instanceof FormControl ) {
					Object.defineProperty( this ,  key ,{
						get() {
							return this.form.get(key).value ;
						},
						set( val ) {
							if( !val.update )
								this.form.get(key).value = val ;
						}
					})
				}
			});

			this.change$ = new Observable() ;
			this.valid = this.form.valid ;
			this.form
				.filter( item => item.event === 'update')
				.subscribe( res => {
					this.change$.next( res ) ;
					const key = res.control.key ;
					this[key] = { update: true , value :res.control.value };
					this.valid = this.form.valid ;
				});

			const _proto = this.__proto__ ;
			Reflect.deleteProperty(_proto.__proto__, '_controls' ) ;
			Reflect.deleteProperty(_proto.__proto__, '_mixControls' ) ;
			Reflect.deleteProperty(_proto.__proto__, '_tips' ) ;
			Reflect.deleteProperty(_proto.__proto__, '_initData' ) ;
		}
	}

	const initData = new target ;

	( proto._initData || ( proto._initData = {} ) ) ;

	Object.keys( initData ).forEach( key => {
		if( ! ( initData[key] instanceof Function)  )
			proto._initData[key] = initData[key] ;
	});

	if( proto._controls ) {
		const controls = proto._controls ;

		const initData = proto._initData ;

		const mixControl = proto._mixControls ;

		if( initData )
			Object.keys( initData ).forEach( key => {
				if( controls.hasOwnProperty(key) )
					controls[key][0] = initData[key] ;
			});

		const form = FormBuilder.group( controls ) ;

		if( mixControl )
			Object.keys(mixControl).forEach(key => {
				if( !form.get( key ) )
					form.add( key , mixControl[key] ) ;
			})

		DataTransportObject.prototype.form = form ;
	}

	if( proto._tips ) {
		DataTransportObject.prototype.tips = proto._tips ;
	}

	return DataTransportObject;
};

export const Mix = ( DTO ) => {
	return function( target ) {
		const proto = target.prototype ;
		const DTOForm = ( DTO.prototype.form || {} ).controls || {} ;
		( proto._mixControls || ( proto._mixControls = {} )) ;

		Object.keys( DTOForm ).forEach( controlName => {
			proto._mixControls[controlName] = DTOForm[controlName] ;
		});

		const dto = new DTO ;

		const internalProps = ['$message' , "valid" , 'change'] ;

		Object.keys( dto ).forEach( key => {
			if(
				!internalProps.includes(key) && !proto._mixControls.hasOwnProperty(key)
			) {
				console.log( DTOForm ) ;
				proto._mixControls[key] = new FormControl( dto[key] ) ;
			}
		});

		return target ;
	}
}

export const Description = ( desc ) => {
	return function( target , key ) {
		( target._tips || ( target._tips = {} ) ) ;
		target._tips[key] = desc ;
	}
};
