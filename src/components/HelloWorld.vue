<template>
	<div class="hello" >
		<div @click="change">
			add
		</div>
		<div>
			{{ testForm.data }}
		</div>
		<div>
			<div>
				valid: {{ testForm.valid }}
			</div>
			<div>
				id: {{ testForm.id }}
			</div>
		</div>
		<input v-model = 'testForm.data'>
	</div>
</template>

<script>
import { Component , Props , Watch , Computed , Hook , Refs , Emit } from './calss.decorator' ;

import Vue from 'vue' ;
import Test from './test' ;

import { DTO , NotNull , Mix , Description , MinLen } from '../form' ;

@DTO
class BaseDto {
	id = 123 ;

	@NotNull aaa
}

@DTO
@Mix(BaseDto)
class DataTransObject {

	constructor() {
	}

	@NotNull
	@MinLen(5)
	@Description("data不能为空")
	data
}

const message = {
	warning: ( tip ) => {
		alert( tip )
	}
}
@Component({ components: { Test }})
export default class Hello extends Vue{
	change(  ) {
	}

	filter(id, definition) {
	}

	testForm = new DataTransObject( message );

	@Hook created () {
		this.testForm.change$
			.filter( item => item.event === 'update' )
			.map( item => item.value )
			.subscribe( res => {
				console.log( this.testForm )
			})
	}
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}

a {
    color: #42b983;
}
</style>
