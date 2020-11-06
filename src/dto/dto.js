import { FormBuilder } from './model' ;


export const DTO = function( target ) {
	const iniData = new target ;

	const formConfig = {} ;

	const config = target.prototype.config ;

	Object.keys(config).forEach( key => {
		formConfig[key] = [ iniData[key] ? iniData[key] : ''  , config[key].validator ] ;
	});

	return class _Data{
		constructor() {
			this.form = FormBuilder.group( formConfig ) ;

			Object.keys(config).forEach( key => {
				Object.defineProperty(this , key , {
					get() {
						return this.form.value[key] ;
					},
					set(v) {
						this.form.patchValue({ [key]: val }) ;
					}
				})
			});
		}

		get control() {
			return this.form.controls ;
		}

		get value () {
			return this.form.value ;
		}

		patch(obj) {
			this.form.patchValue(obj) ;
		}

		valid () {
			return this.form.valid ;
		}

		markAsDirty() {
			this.form.markAsDirty() ;
		}

		getErrors() {
			console.log( iniData ) ;
		}
	}
}

export const Validators = function( validators ) {
	return function ( target , propertyKey )  {
		const config = ( target['config'] ||  ( target['config'] = {}) ) ;
		if( !config[propertyKey] || !config[propertyKey].validator ) {
			( config[propertyKey] || ( config[propertyKey] = {} ) ).validator = validators ;
		} else {
			config[propertyKey].validator.concat(validators) ;
		}
	}
}

export const Desc = function( desc ) {
	return function( target , propertyKey ) {
		const config = ( target['config'] ||  ( target['config'] = {}) ) ;
		( config[propertyKey] || ( config[propertyKey] = {} ) ).desc = desc ;
	}
}