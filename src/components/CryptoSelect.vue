<script setup lang="ts">
	import { ref, watch } from 'vue'
	const { coins } = defineProps(["coins"])
	console.log("?", coins)
	const selected_coins = ref([]);
	watch(selected_coins, (ids) => {
	console.log()
	})
</script>

<template>
	<h1>Selección de Crypto</h1>
	<ul>
		<li v-for="coin in coins">
		<label>
			<input type="checkbox" :value="coin.id" v-model="selected_coins"/>
			{{coin.symbol}}: {{coin.name}}
		</label>
		</li>
	</ul>
</template>
