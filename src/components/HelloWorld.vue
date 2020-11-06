<template>
	<div class="hello" >
		<input v-model = 'test.id' type="text" @input="inputChange">
	</div>
</template>

<script>
import { Component , Props , Watch , Computed , Hook , Refs , Emit } from './calss.decorator' ;
import {Desc, DTO, Validators} from '../dto/dto' ;
import Vue from 'vue' ;
import Test from './test' ;
import { FormBuilder} from '../dto/model' ;
import { Validator } from "../dto/validator";

@DTO
class Query {

	@Validators([Validator.required])
	@Desc('adsasdasd')
	id = 1 ;

	@Validators([Validator.required])
	aaa = 1 ;
}

@Component({ components: { Test }})
export default class Hello extends Vue{
	change() {
	}

	test = new Query;

	filter(id, definition) {
	}

	@Hook created () {
		console.log( this.test.getErrors() ) ;
	}

	inputChange() {
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
