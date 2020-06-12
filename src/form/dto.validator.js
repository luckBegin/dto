import {Validator} from "./Validator";

const setControl = ( target , key , ...validator ) => {
	( target._controls || ( target._controls = {} ) ) ;
	const control = target._controls[key] ;
	if( control ) {
		target._controls[key][1].concat(validator) ;
	} else {
		target._controls[key] = [ null ,  validator ] ;
	}
}

export const NotNull = ( target  , key) => {
	const validator = Validator.require ;
	return setControl( target , key , validator ) ;
};

export const MinLen = ( len ) => {
	const validator = Validator.minLen( len ) ;
	return function( target , key ) {
		return setControl( target , key , validator ) ;
	}
}

export const Maxlen = ( len ) => {
	const validator = Validator.maxLen( len ) ;
	return function( target ,key ) {
		return setControl( target , key , validator ) ;
	}
}

export const Len = ( len ) => {
	const minLen = Validator.minLen(len) ;
	const maxLen = Validator.maxLen(len) ;

	return function ( target , key) {
		return setControl( target , key , minLen , maxLen ) ;
	}
}

export const Tel = ( target  , key) => {
	const validator = Validator.tel ;
	return setControl( target , key , validator ) ;
};

export const NumOrCharacter = ( target, key ) => {
	const validator = Validator.numOrCharacter ;
	return setControl( target , key , validator ) ;
}

export const IdCard = ( target, key ) => {
	const validator = Validator.idCard ;
	return setControl( target , key , validator ) ;
}

export const IntNum = ( target , key ) => {
	const validator = Validator.initNum ;
	return setControl( target , key , validator ) ;
}
