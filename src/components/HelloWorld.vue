<template>
	<div class="hello" >
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

	filter(id, definition) {
	}


	@Hook created () {
		const b = FormBuilder.group({
			a: [ null , [Validator.required ] ]
		});
		console.log( b ) ;
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
