export const RegGroup = {
	fileDocType: () => new RegExp('doc|docx|xls|xlsx|ppt|pptx|pdf' , 'gi') ,
	fileImageType: () => new RegExp('jpg|gif|bmp|png' , 'gi') ,
	fileVideoType: () => new RegExp('mp3|mp4|wav|ogg|asf|au|voc|aiff|rm|svcd|vcd' , 'gi') ,
	numOrCharacter: () => new RegExp('^[0-9a-zA-Z]+$' , 'gi') ,
	tel: () => new RegExp( '^1[3456789]\\d{9}$','gi') ,
	idCard: () => new RegExp( '(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)' , 'gi') ,
	intNum: () => new RegExp( '^[1-9]\\d*$','gi')
}

export class Validator {
	static require( control ) {
		return new Promise( resolve => {
			resolve( !(control.value === null || control.value === undefined || control.value === '') ) ;
		})
	}

	static maxLen( length , notRequire ) {
		return function( control ) {
			return new Promise( resolve => {
				const val =  control.value === undefined || control.value === null ? '' : control.value ;
				if (notRequire) {
					return  resolve( val ? val.toString().length <= length : true );
				}
				return resolve( val.toString().length <= length ) ;
			})
		}
	}

	static minLen( length , notRequire ) {
		return function( control ) {
			return new Promise( resolve =>  {
				const val = control.value === undefined || control.value === null ? '' : control.value ;
				if (notRequire) {
					return resolve ( val ? val.toString().length >= length: true ) ;
				}

				return resolve( val.toString().length >= length ) ;
			});
		}
	}


	static numOrCharacter(control) {
		return new Promise( resolve => {
			resolve( RegGroup.numOrCharacter().test( control.value )) ;
		})
	}

	static tel( control ) {
		return new Promise( resolve => {
			resolve( RegGroup.tel().test( control.value )) ;
		});
	}

	static idCard( control ) {
		return new Promise( resolve =>  {
			resolve( RegGroup.idCard().test(control.value )) ;
		})
	}

	static initNum( control ) {
		return new Promise( resolve => {
			resolve( RegGroup.intNum().test( control.value )) ;
		})
	}
}
