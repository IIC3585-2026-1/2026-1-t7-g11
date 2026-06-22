<script setup lang="ts">
	import { ref } from 'vue'
	import { useVModel } from "@nanostores/vue";
	import { selectedCoins } from "../stores/coinStore.ts"
	const { coins } = defineProps(["coins"])

	const selectedCoinsVModel = useVModel(selectedCoins);
</script>

<template>
	<h1>Selección de Crypto</h1>
	<ul>
		<li v-for="coin in coins">
		<label>
			<input type="checkbox" :value="coin.id" v-model="selectedCoinsVModel"/>
			{{coin.symbol}}: {{coin.name}}
		</label>
		</li>
	</ul>
</template>
