/**
 * createBY yaojie in 2020-06-12
 * 由于在使用过程发现之前FormGroup FormArray FromControl不满足部分场景
 * 所以对之前 FormGroup FormArray FromControl 的重构
 * 并且后续用于组合实现DTO
 *
*/

import { ReadOnly } from './object.decorator' ;
import {Validator} from "./validator";
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
	) {}

	/**
	 *  当前control的父级
	 *  @return  { FormControl | FormArray | FormGroup  }
	 */
	_parent ;

	get parent() {
		return this._parent ;
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
	 */
	pristine ;

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
	 * 更新pristine状态
	 * onlySelf为false时 仅仅更新自身 , 为true时更新父级所有control
	 */
	_updatePristine(opts) {
		this.pristine = !this._anyControlsDirty() ;

		if( this._parent && !opts.onlySelf ) {
			this._parent._updatePristine(opts) ;
		}
	}

	updateValueAndValidity( opt ) {

	}
}


/**
 *  @param {validator|validator[]} validator
 *  转换validator
 */
const coerceToValidator = ( validator ) => {
	return Array.isArray( validator ) ? composeValidators : validator || null ;
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
 */
export class FormControl extends AbstractControl {

	/**
	 * @param { boolean | string | number | object } formState
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
			this.value = formState.value ;
		}
	}
}
