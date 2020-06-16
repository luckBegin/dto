<template>
	<div style="border-top: 1px solid #ccc">
		<div @click="close">emit</div>
	</div>
</template>
<script>
import {Component, Emit, Props, Watch} from './calss.decorator' ;
@Component
export default class Test {

	@Emit("change")
	close() {

		return 123 ;
	}
}
</script>
