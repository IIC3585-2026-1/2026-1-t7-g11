<script setup lang="ts">
	import { useVModel } from "@nanostores/vue";
	import { selectedCoins } from "../stores/coinStore.ts"
	import type { CryptoCoin } from "../api/api.ts"

	const { coins } = defineProps<{ coins: CryptoCoin[] }>()

	const selectedCoinsVModel = useVModel(selectedCoins);
</script>

<template>
	<h1>Selección de Crypto</h1>
	<ul class="coin-grid">
		<li v-for="coin in coins" :key="coin.id" class="coin-grid__item">
			<label
				class="coin-card"
				:class="{ 'coin-card--selected': selectedCoinsVModel.includes(coin.id) }"
			>
				<input
					type="checkbox"
					:value="coin.id"
					v-model="selectedCoinsVModel"
					class="coin-card__input"
				/>
				<img class="coin-card__image" :src="coin.image" :alt="coin.name" />
				<span class="coin-card__name">{{ coin.name }}</span>
				<span class="coin-card__symbol">{{ coin.symbol.toUpperCase() }}</span>
			</label>
		</li>
	</ul>
</template>

<style scoped>
	.coin-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		align-items: center;
		width: min(100%, 1100px);
		margin: 0 auto;
		padding: 0;
		list-style: none;
	}

	.coin-grid__item {
		flex: 0 1 calc((100% - 3rem) / 5);
		max-width: calc((100% - 3rem) / 5);
		min-width: 0;
	}

	.coin-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-height: 150px;
		padding: 1rem 0.35rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.04);
		text-align: center;
		cursor: pointer;
		transition: background-color 0.15s ease, border-radius 0.15s ease;
	}

    .coin-card:hover, .coin-card:active {
        background-color: var(--selection);
    }

	.coin-card--selected {
		background-color: rgba(108, 102, 75, 0.15);
		border-radius: 5px;
	}

	.coin-card__input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.coin-card__image {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.coin-card__name {
		font-weight: 600;
		line-height: 1.2;
	}

	.coin-card__symbol {
		font-size: 0.85rem;
		opacity: 0.75;
		text-transform: uppercase;
	}

	.coin-card:hover {
		border-color: rgba(255, 255, 255, 0.24);
		transform: translateY(-1px);
	}

	.coin-card:focus-within {
		outline: 2px solid rgba(255, 255, 255, 0.5);
		outline-offset: 2px;
	}
</style>
