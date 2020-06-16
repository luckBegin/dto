<template>
	<div class="hello" >
		<input v-model = 'test' type="text" @input="inputChange">
	</div>
</template>

<script>
import { Component , Props , Watch , Computed , Hook , Refs , Emit } from './calss.decorator' ;

import Vue from 'vue' ;
import Test from './test' ;
import { FormBuilder } from '../dto/model' ;
import { Validator } from "../dto/validator";

@Component({ components: { Test }})
export default class Hello extends Vue{
	change() {
	}

	test ;

	filter(id, definition) {
	}

	form = FormBuilder.group({
		a: [ null , [Validator.min(5) ] ]
	})
	@Hook created () {
	}

	inputChange() {
		this.form.patchValue({
			a: this.test
		})
		console.log( this.form )
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
