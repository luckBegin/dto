/**
 * createBY yaojie in 2020-06-12
 * 由于在使用过程发现之前FormGroup FormArray FromControl不满足部分场景
 * 并且为了结合vue 改了 getter 和 setter 耦合度太高, 不利于脱离框架使用
 * 针对这种情况又分离了原本form和vue耦合在一起, 加了一层DTO用于连接Form和vue
 * 所以对之前 FormGroup FormArray FromControl 进行重构
 *
*/

import { Validator } from "./validator";
import { Observable } from './Observable.class' ;

export const VALID = 'VALID' ;
export const PENDING = 'PENDING' ;
export const INVALID = 'INVALID' ;
export const DISABLED = 'DISABLED';

/**
 * 抽象类
 * 是FormArray FormGroup FormControl的 父类
 */
export class AbstractControl {

	/**
	 * 当前value
	 * @return { object }
	 */
	value ;

	/**
	 *  传入校验器 ,  同步校验器 以及 异步校验器
	 */
	constructor(
		validator , asyncValidator
	) {
		this.validator = validator ;
	}

	/**
	 *  当前control的父级
	 *  @return  { FormArray | FormGroup  }
	 */
	_parent ;

	get parent() {
		return this._parent ;
	}

	/**
	 * @param { FormArray | FormGroup } parent
	 */
	setParent( parent ) {
		this._parent =  parent
	}
	/**
	 *  当前control的状态
	 *  **VALID** 代表当前value通过所有校验
	 *  **INVALID** 代表当前value未通过所有校验
	 *  **PENDING** 代表当前value处于校验状态
	 *  **DISABLED** 代表当前value不需要校验
	 */
	status ;

	get valid() {
		return this.status === VALID ;
	}

	get invalid (){
		return this.status === INVALID ;
	}

	get pending () {
		return this.status === PENDING ;
	}

	get disabled() {
		return this.status === DISABLED ;
	}

	get enabled() {
		return this.status !== DISABLED ;
	}


	/**
	 * 用于检测form初始值是否包含配置
	 */
	_isBoxedValue( formState ){
		return typeof formState  === 'object' && formState !== null
			&& Object.keys( formState ).length === 2 && 'value' in formState && 'disabled' in formState ;
	}

	/**
	 *  返回校验失败的信息 , 没有则为null
	 *  return { [key: string : any ]} | null
	 */
	errors ;

	/**
	 *  是否为原始值,代表用户是否输入更新过
	 *  true: 未输入 false: 输入过
	 */
	pristine = true ;

	get dirty() {
		return !this.pristine ;
	}

	/**
	 *  当value发生改变时触发
	 *  @type { Observable< any > }
	 */
	valueChange ;

	/**
	 *  当status改变时触发
	 *  @type { Observable< any > }
	 */
	statusChanges ;

	/**
	 *  @type {function((Function|Function[])): *} 校验器
	 */
	validator ;

	/**
	 *  设置当前的validator
	 * @param { function | function[]  } newValidator
	 * @example
	 * Validator.require | [ Validator.require ]
	 */
	setValidators( newValidator ) {
		this.validator = coerceToValidator( newValidator ) ;
	}


	/**
	 * 清空当前validator
	 */
	clearValidators() {
		this.validator = null ;
	}

	/**
	 * @param { { onlySelf: boolean } } opts ;
	 * 将当前control标记为dirty 即表示用户修改过
	 * onlySelf为false时 仅仅更新自身 , 为true时更新父级所有control
	 */
	markAsDirty( opts ) {
		this.pristine = false ;

		if( this._parent && !opts.onlySelf ) {
			this._parent.markAsDirty(opts) ;
		}
	}

	/**
	 * @param { { onlySelf: boolean } } opts ;
	 * 将当前control标记为pristine 即表示用户未修改过
	 * onlySelf为false时 仅仅更新自身 , 为true时更新父级所有control
	 */
	markAsPristine( opts ) {
		this.pristine = true ;

		this._forEachChild( control => {
			control.markAsPristine( opts ) ;
		});


		if( this._parent && !opts.onlySelf ) {
			// 更新父级pristine状态
			this._parent._updatePristine(opts) ;
		}
	}

	/**
	 *  抽象方法 由子类去实现
	 *  用于遍历自身所有child
	 */
	_forEachChild(fn){} ;

	/**
	 *  抽象方法 用子类去实现
	 *  用于检测是否存在某种状态的control
	 *  @param { Function } condition
	 */
	_anyControls( condition ) {} ;

	/**
	 * 检测是否有control处于dirty状态
	 */
	_anyControlsDirty() {
		return this._anyControls( control => control.dirty ) ;
	};

	/**
	 * 检测是否有control处于某种状态
	 */
	_anyControlsHaveStatus(status){
		return this._anyControls((control) => control.status === status);
	}

	/**
	 * 更新pristine状态
	 * onlySelf为false时 仅仅更新自身 , 为true时更新父级所有control
	 */
	_updatePristine(opts) {
		this.pristine = !this._anyControlsDirty() ;

		if( this._parent && !opts.onlySelf ) {
			this._parent._updatePristine(opts) ;
		}
	}


	/**
	 * 更新control value 以及 status
	 */
	updateValueAndValidity( opts = { onlySelf: false , emitEvent: false } ) {
		this._setInitialStatus() ;
		this._updateValue() ;

		if( this.enabled ) {
			this.errors = this._runValidator() ;
			this.status = this._calculateStatus();
		}

		if( opts.emitEvent !== false ) {
			this.valueChange.next( this.value ) ;
			this.statusChanges.next( this.status ) ;
		}

		if( this._parent && !opts.onlySelf ) {
			this._parent.updateValueAndValidity(opts) ;
		}
	}

	/**
	 * 实例化时初始化状态
	 */
	_setInitialStatus() {
		this.status = this._allControlsDisabled() ? DISABLED : VALID ;
	}

	/**
	 * 执行validator
	 */
	_runValidator(){
		return this.validator ? this.validator( this ) : null ;
	}

	/**
	 * 计算当前应该的状态
	 */
	_calculateStatus(){
		if( this._allControlsDisabled() ) return DISABLED ;
		if( this.errors ) return INVALID ;
		if( this._anyControlsDirty(PENDING) ) return PENDING ;
		if( this._anyControlsDirty(INVALID) ) return INVALID ;
		return VALID ;
	}

	/**
	 * 初始化Observeable
	 */
	_initObservables() {
		this.statusChanges = new Observable ;
		this.valueChange = new Observable ;
	}

	/**
	 * 抽象方法 由子类实现
	 * 检测当前control是否全为disabled
	 */
	_allControlsDisabled() {}

	/**
	 * 抽象方法 由子类实现
	 * 更新value
	 */
	_updateValue() {}

	/**
	 * 抽象方法 有子类实现
	 * 重置control
	 */
	reset() {} ;

	/**
	 * 抽象方法 有子类实现
	 * 设置control value
	 */
	setValue() {} ;

	/**
	 * 抽象方法 有子类实现
	 * 匹配 control value
	 */
	patchValue() {} ;

	/**
	 * 抽象方法 有子类实现
	 * 用于value改变时收集
	 */
	_onCollectionChange = () => {};

	_registerOnCollectionChange(fn) {
		this._onCollectionChange = fn ;
	}
}

/**
 *  @param {validator|validator[]} validator
 *  转换validator
 */
const coerceToValidator = ( validator ) => {
	return Array.isArray( validator ) ? composeValidators(validator): validator || null ;
}

/**
 *  @param { function | function[]  } validator
 *  合并validator
 */
const composeValidators = ( validator ) => {
	return validator !== null ? Validator.compose( validator.map( item => item ) ) : null ;
}

/**
 * FormControl类
 * 用于单个form 的控制
 * @example
 * const name = new FormControl('张三' , Validator.required )
 * const name = new FormControl('张三' , [Validator.required , Validator.maxLen(5) ] )
 */
export class FormControl extends AbstractControl {

	/**
	 * @param { Any } formState
	 * @param { validator | validator[] } validator
	 * @param { asynCValidator | asynvValidator[] } asyncValidator
	 * todo asyncValidator 暂不支持 暂留入口
	 */
	constructor(
		formState ,
		validator ,
		asyncValidator
	) {
		super(
			coerceToValidator( validator ) ,
		)
		this._applyFormState(formState) ;
		this.updateValueAndValidity({ onlySelf: true , emitEvent: false }) ;
		this._initObservables();
	}

	/**
	 * 设置value
	 * @param { any } formState
	 * @example
	 * _applyFormState( 1 ) | _applyFormState( { value: 1 , disabled : false } )
	 */
	_applyFormState(formState) {
		if( this._isBoxedValue(formState ) ) {
			this.value = formState.value ;
			formState.disabled ? this.disable({onlySelf: true, emitEvent: false}) :
				this.enable({onlySelf: true, emitEvent: false});
		} else {
			this.value = formState
		}
	}


	/**
	 * 设置value
	 * @param { Any } value
	 * @param { {onlySelf: boolean  , emitEvent: boolean } } opts
	 */
	setValue( value , opts) {
		this.value = value ;
		this.updateValueAndValidity(opts) ;
	}

	/**
	 * 匹配value
	 * @param { Any } value
	 * @param { {onlySelf: boolean  , emitEvent: boolean } } opts
	 */
	patchValue( value , opts ) {
		this.setValue( value , opts ) ;
	}

	/**
	 * 重置control
	 * @param { Any } formState 重置control时的初始值
	 * @param { {onlySelf: boolean  , emitEvent: boolean } } opts
	 *
	 */
	reset(formState , opts) {
		this._applyFormState(formState) ;
		this.markAsPristine(opts) ;
		this.setValue( this.value , opts ) ;
	}

	/**
	 * 实现AbstractControl的_anyControls抽象方法
	 * FormControl 为单个 不需要遍历
	 */
	_anyControls(condition) { return false }

	/**
	 * 实现AbstractControl的_allControlsDisabled抽象方法
	 * FormControl自身的 disabled值即为所有
	 */
	_allControlsDisabled() {
		return this.disabled ;
	}
}

/**
 * FormGroup类
 * 用于对整个表单的控制
 * ** 配合工厂方式使用
 * @example
 *
 * const personForm = FormBuilder.group({
 *     age: [ 12 , Validator.required ] ,
 *     name: [ '张三' , [ Validator.required] ]
 * })
 */
export class FormGroup extends AbstractControl{

	controls = {} ;
	/**
	 * @param { { controlName : AbstractControl} } controls
	 * @param { validator | validator[] } validator
	 * @param { asynCValidator | asynvValidator[] } asyncValidator
	 * todo asyncValidator 暂不支持 暂留入口
	 */
	constructor(
		controls ,
		validator ,
		asyncValidator
	) {
		super(
			coerceToValidator( validator )
		)
		this.controls = controls ;
		this._initObservables() ;
		this._setUpControls() ;
		this.updateValueAndValidity({onlySelf: true, emitEvent: false});
	}

	/**
	 * 设置control
	 */
	_setUpControls() {
		this._forEachChild( control => {
			control.setParent( this ) ;
			control._registerOnCollectionChange(this._onCollectionChange);
		});
	}

	/**
	 * AbstractControl中_forEachChild抽象方法的实现
	 * 用于遍历control
	 */
	_forEachChild(cb) {
		Object.keys(this.controls).forEach( k => cb(this.controls[k] , k )) ;
	}

	/**
	 * 用于注册control
	 * @param { string } name
	 * @param { AbstractControl } control
	 * @return AbstractControl
	 */
	registerControl( name , control ) {
		if( this.controls[name] ) return this.controls[name] ;
		this.controls[name] = control ;
		control.setParent(  this ) ;
		control._registerOnCollectionChange(this._onCollectionChange);
		return control ;
	}

	/**
	 * 用于添加control
	 * 与registerControl不同在于registerControl不触发检测更新
	 * @param { string } name
	 * @param { AbstractControl } control
	 * @return AbstractControl
	 */
	addControl( name, control ) {
		this.registerControl(name ,control);
		this.updateValueAndValidity() ;
		this._onCollectionChange();
	}

	/**
	 * @param { string } name
	 * 移除某个control
	 */
	removeControl( name ) {
		if( this.controls[name] ) this.controls[name]._registerOnCollectionChange(() => {});
		delete ( this.controls[ name ] ) ;
		this.updateValueAndValidity() ;
		this._onCollectionChange() ;
	}

	/**
	 * 用于替换某个control
	 */
	setControl( name , control ) {
		if( this.controls[name] ) this.controls[name]._registerOnCollectionChange( () => {} ) ;
		delete ( this.controls[ name ] ) ;
		if( control ) this.registerControl( name , control ) ;
		this.updateValueAndValidity() ;
		this._onCollectionChange() ;
	}

	/**
	 * 检测是否存在某个control
	 * @param { string } controlName
	 * @return boolean
	 */
	contains( controlName ) {
		return this.controls.hasOwnProperty( controlName ) && this.controls[controlName].enabled ;
	}

	/**
	 * @param { { [key: string] : any } } value
	 * @param { { onlySelf: boolean } } opts ;
	 */
	setValue( value , opts ) {
		this._checkAllValuesPresent(value);
		Object.keys(value).forEach( name => {
			this.controls[name].setValue(value[name] , {onlySelf: true, emitEvent: opts.emitEvent})
		});
		this.updateValueAndValidity(opts) ;
	}

	/**
	 * @param { Any } value
	 */
	_checkAllValuesPresent( value ) {
		this._forEachChild((control, name) => {
			if (value[name] === undefined) {
				throw new Error(`Must supply a value for form control with name: '${name}'.`);
			}
		});
	}

	patchValue( value , opts ) {
		Object.keys(value).forEach( name => {
			if( this.controls.hasOwnProperty(name) ) {
				this.controls[name].patchValue(value[name], {onlySelf: true, emitEvent: opts.emitEvent});
			}
		})
	}

	reset( value, opts ) {
		this._forEachChild( control => {
			control.reset(value[name], {onlySelf: true, emitEvent: opts.emitEvent});
		});
		this._updatePristine(opts);
		this.updateValueAndValidity(opts) ;
	}

	_updateValue() {
		this.value = this._reduceValue();
	}

	_reduceValue() {
		return this._reduceChildren( {} , ( acc , control , name ) => {
			if( control.enabled || this.disabled ) {
				acc[name] = control.value ;
			}
			return acc ;
		});
	}

	_reduceChildren(initValue , fn) {
		let res = initValue ;
		this._forEachChild( ( control,name ) => {
			res = fn( res , control , name ) ;
		})
		return res ;
	}
}

/**
 * FormBuild用于作为构造form的入口
 */
class CFormBuilder {
	group( controlsConfig , options ) {
		const controls = this._reduceControls(controlsConfig);

		let validators = null ;
		let asyncValidators = null ;

		if( options != null ) {
			validators = options.validators ? options.validators : null ;
			asyncValidators = options.asyncValidators ? options.asyncValidators : null ;
		}

		return new FormGroup( controls , validators , asyncValidators ) ;
	}

	_reduceControls( controlsConfig ) {

		const controls = {} ;

		Object.keys( controlsConfig ).forEach( controlName => {
			controls[controlName] = this._createControl( controlsConfig[controlName] ) ;
		})

		return controls ;
	}

	_createControl(controlConfig) {
		if( controlConfig instanceof FormControl || controlConfig instanceof FormGroup ) {
			return controlConfig
		} else if( Array.isArray(controlConfig)) {
			const value = controlConfig[0] ;
			const validator = controlConfig.length > 1 ? controlConfig[1] : null ;
			const asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null ;
			return this.control( value , validator , asyncValidator ) ;
		} else {
			return this.control( controlConfig ) ;
		}
	}

	control(
		formState ,
		validators,
		asyncValidators
	) {
		return new FormControl( formState , validators , asyncValidators ) ;
	}
}

export const FormBuilder = new CFormBuilder ;
