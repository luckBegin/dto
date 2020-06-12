export class Observable {
	_notifies = {} ; // Array< { success : () => void , error: () => void } >
	_idx = 0 ;
	constructor( fn ) {
		if( fn )
			fn( this )  ;
		return this ;
	} ;

	next( data ) {
		Object.keys( this._notifies ).forEach( notifies => {
			const notify = this._notifies[notifies] ;
			if( notify.hasOwnProperty('success') )
				notify.success( data ) ;
		})
		return this ;
	}

	subscribe( success , error ) {
		this._notifies[this._idx] = {
			success , error
		} ;
		const index = this._idx ;
		this._idx += 1 ;
		return { unsubscribe : () => {
			Reflect.deleteProperty(this._notifies , index ) ;
		}}
	}

	error ( data ) {
		Object.keys( this._notifies ).forEach( notifies => {
			const notify = this._notifies[notifies] ;
			if( notify.hasOwnProperty('error') )
				notify.error( data ) ;
		})
		return this ;
	}

	filter ( fn ) {
		const ob = new Observable ;
		this.subscribe( res => {
			if( fn ( res ) ) {
				ob.next( res ) ;
			}
		} , err => {
			ob.error( err )
		})
		return ob ;
	}

	map ( fn ) {
		const ob = new Observable ;
		this.subscribe( res => {
			ob.next( fn( res ) )
		} , err => {
			ob.error( err ) ;
		})
		return ob
	}
}

export const forkJoin = ( observableArr ) => {
	if( !observableArr instanceof  Array ) throw new Error('arguments must be an array') ;

	const ob = new Observable() ;

	observableArr.forEach( item => {
		item.subscribe( data => {
			ob.next( data )
		} , err => {
			ob.error(  err ) ;
		})
	});

	return ob ;
}
