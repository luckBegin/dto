const isPresent = ( o ) => {
	return o != null ;
};

const _executeValidators = ( control , validators ) => {
	return validators.map( v => v( control ) ) ;
};

const _mergeErrors = ( arrayOfErrors ) => {
	let res = {} ;

	arrayOfErrors.forEach( err => {
		res = err != null ? { ...err , ...res } : res ;
	});

	return Object.keys(res).length === 0 ? null : res ;
};

export class Validator {
	static compose( validators ) {
		if( !validators.length ) return null ;

		const presentValidators = validators.filter( isPresent ) ;

		if( !presentValidators.length ) return null ;

		return function( control ) {
			return _mergeErrors( _executeValidators( control , presentValidators ) ) ;
		};
	}

	static required( formControl ) {
		return  emptyValue(formControl.value)  ? { 'invalid': true } : null ;
	}

	static len( number ) {
		return function( control ) {
			return (control.value || '').length === number ? null : { 'invalid': true };
		}
	}
}



const emptyValue = ( val ) => {
	return val === '' || val === undefined || val === null || val === 'undefined' || val === 'null' ;
};