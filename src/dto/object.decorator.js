export const ReadOnly = ( target , propertyKey ) => {
	Object.defineProperty( target , propertyKey , {
		writable: false
	})
};
