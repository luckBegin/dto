import Vue from 'vue' ;

export function Component ( options ) {
	if(options instanceof Function ) {
		return componentFactory( options )
	}
	return function( component ) {
		return componentFactory( component , options ) ;
	}
}

const componentFactory = ( component , options = {} ) => {
	options.name = options.name || component.name ;

	const proto = component.prototype ;

	const metaConfigs = proto.metaConfigs || {} ;

	Object.getOwnPropertyNames( proto ).forEach( name => {

		if( name === 'constructor' || name === 'metaConfigs') return void  0 ;

		const descriptor = Object.getOwnPropertyDescriptor(proto , name) ;

		if( descriptor.value === void 0 ) {
			if( descriptor.get || descriptor.set ) {
				( options.computed || (options.computed = {}) )[name] = {
					get: descriptor.get ,
					set: descriptor.set
				}
				return  void  0 ;
			}
			return void 0 ;
		}

		if( descriptor.value instanceof Function ) {
			const _watches = metaConfigs.watches || {} ;
			const _computed = metaConfigs.computed || {} ;
			const _hook = metaConfigs.hook || {} ;
			const _emit = metaConfigs.emit || {} ;

			if( _watches.hasOwnProperty( name ) ) {
				( options.watch || ( options.watch = {} ) )[_watches[name]] = descriptor.value ;
				return  ;
			}

			if( _computed.hasOwnProperty(name)) {
				( options.computed || ( options.computed = {} ) )[_computed[name]] = descriptor.value ;
				return ;
			}

			if( _hook.hasOwnProperty( name ) ) {
				const hookName = Reflect.get( _hook , name ) ;
				options[hookName] = descriptor.value ;
				return  ;
			}

			if( _emit.hasOwnProperty( name ) ) {
				( options.methods || ( options.methods = {} ) )[name] = function( ...args ) {
					this.$emit( Reflect.get(_emit , name )  , descriptor.value.apply( this , args ) ) ;
				}
				return ;
			}

			( options.methods || ( options.methods = {} ) )[name] = descriptor.value ;

		} else {
			( options.mixins || ( options.mixins = [] ) ).push({
				data(){
					return { [name] : descriptor.value } ;
				}
			})
		}
	});

	( options.mixins || ( options.mixins = [] ) ).push({
		data() {
			return collectInstanceData( this , component ) ;
		}
	}) ;

	const mounted = options.mounted ? options.mounted : null ;

	options.mounted = function() {
		const ref = ( proto.metaConfigs || {} ) .ref || {} ;

		Object.keys(ref).forEach( key => {
			Object.defineProperty( this , key , {
				get(){
					return this.$refs[key]
				}
			})
		});

		if(mounted)
			mounted.call( this ) ;

		// Reflect.deleteProperty(proto , 'metaConfigs') ;
	}

	if( metaConfigs.props ) {
		options.props = metaConfigs.props ;
	}

	const superProto = Object.getPrototypeOf( component.prototype ) ;
	const superClass = superProto instanceof Vue ? superProto.constructor : Vue ;

	return superClass.extend(options) ;
}

const collectInstanceData = ( vm , component )  => {
	const data = {} ;

	const _init = component.prototype._init ;

	component.prototype._init = function () {
		const keys = Object.getOwnPropertyNames(vm)
		if (vm.$options.props) {
			for (const key in vm.$options.props) {
				if (!vm.hasOwnProperty(key)) {
					keys.push(key)
				}
			}
		}
		keys.forEach(key => {
			if (key.charAt(0) !== '_') {
				Object.defineProperty(this, key, {
					get: () => vm[key],
					set: value => { vm[key] = value },
					configurable: true
				})
			}
		})
	}
	const instance = new component() ;

	component.prototype._init = _init ;

	const proto = component.prototype ;
	const props = ( proto.metaConfigs || {} ).props || {} ;

	Object.keys( instance ).forEach( name => {
		if( !props.hasOwnProperty( name ) ) {
			data[name] = instance[name] ;
		}
	});

	return data ;
}

// vue properties
export const Props = ( options ) => {
	return function( target , key ) {
		( target.metaConfigs || ( target.metaConfigs = {} ) ) ;
		( target.metaConfigs.props || (  target.metaConfigs.props = {} ))[key] = options ;
	}
}

export const Watch = ( name ) => {
	return function( target , key ) {
		( target.metaConfigs || ( target.metaConfigs = {} ) ) ;
		( target.metaConfigs.watches || (  target.metaConfigs.watches = {} ))[key] = name ;
	}
}

export const Computed = ( name ) => {
	return function( target , key ) {
		( target.metaConfigs || ( target.metaConfigs = {} ) ) ;
		( target.metaConfigs.computed || (  target.metaConfigs.computed = {} ))[key] = name ;
	}
}

export const Hook = ( component , key ) => {
	if( component instanceof Object ) {
		( component.metaConfigs || ( component.metaConfigs = {} ) ) ;
		( component.metaConfigs.hook || (  component.metaConfigs.hook = {} ))[key] = key ;
	} else {
		return function( target ,key ) {
			( target.metaConfigs || ( target.metaConfigs = {} ) ) ;
			( target.metaConfigs.hook || (  target.metaConfigs.hook = {} ))[key] = component ;
		}
	}
}

export const Refs = ( name ) => {
	return function ( target , key) {
		( target.metaConfigs || ( target.metaConfigs = {} ) ) ;
		( target.metaConfigs.ref || (  target.metaConfigs.ref = {} ))[key] = name ;
	}
}
export const Emit = ( component , key ) => {
	if( component instanceof Object ) {
		( component.metaConfigs || ( component.metaConfigs = {} ) ) ;
		( component.metaConfigs.emit || (  component.metaConfigs.emit = {} ))[key] = key ;
	} else {
		return function( target ,key ) {
			( target.metaConfigs || ( target.metaConfigs = {} ) ) ;
			( target.metaConfigs.emit || (  target.metaConfigs.emit = {} ))[key] = component ;
		}
	}
}
