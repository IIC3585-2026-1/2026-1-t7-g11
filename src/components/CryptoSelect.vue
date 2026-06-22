<script setup lang="ts">
	import { ref } from 'vue'
	import { useVModel } from "@nanostores/vue";
	import { selectedCoinsStore } from "../stores/coinStore.ts"
	const { coins } = defineProps(["coins"])

	const selectedCoins = useVModel(selectedCoinsStore);
</script>

<template>
	<h1>Selección de Crypto</h1>
	<ul>
		<li v-for="coin in coins">
		<label>
			<input type="checkbox" :value="coin.id" v-model="selectedCoins"/>
			{{coin.symbol}}: {{coin.name}}
		</label>
		</li>
	</ul>
</template>
