<script lang="ts">
	import { onMount } from "svelte";
	import Chart from "chart.js/auto";
	import { selectedCoins } from "../stores/coinStore.ts";
	import { getCoinsByIds, type CryptoCoin } from "../api/api.ts";

	type PricePoint = {
		label: string;
		price: number;
	};

	const POLL_INTERVAL_MS = 5 * 60 * 1000;
	const LINE_COLORS = ["#CB3A2A", "#A34D14", "#846E15", "#14710A", "#036A96", "#644AC9", "#A3144D"];
	const priceFormatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 6,
	});
	const volumeFormatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		notation: "compact",
		compactDisplay: "short",
		maximumFractionDigits: 2,
	});


	let coins: CryptoCoin[] = [];
	let selectedCoinIds: string[] = [];
	let chartCanvas: HTMLCanvasElement | null = null;
	let chart: Chart | null = null;
	let priceHistory: Record<string, PricePoint[]> = {};
	let syncRequestId = 0;

	function formatLabel(date: Date): string {
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function formatPrice(price: number): string {
		return priceFormatter.format(price);
	}

	function formatVolume(volume: number): string {
		return volumeFormatter.format(volume);
	}

	function destroyChart() {
		chart?.destroy();
		chart = null;
	}

	function renderChart() {
		if (!chartCanvas) {
			return;
		}

		if (selectedCoinIds.length === 0) {
			destroyChart();
			return;
		}

		const labels = priceHistory[selectedCoinIds[0]]?.map((point) => point.label) ?? [];
		const datasets = selectedCoinIds.map((coinId, index) => {
			const coin = coins.find((entry) => entry.id === coinId);
			const history = priceHistory[coinId] ?? [];

			return {
				label: coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : coinId,
				data: history.map((point) => point.price),
				borderColor: LINE_COLORS[index % LINE_COLORS.length],
				backgroundColor: LINE_COLORS[index % LINE_COLORS.length],
				tension: 0.35,
				fill: false,
				pointRadius: 2,
			};
		});

		if (chart) {
			chart.data.labels = labels;
			chart.data.datasets = datasets;
			chart.update();
			return;
		}

        Chart.defaults.font.family = "Roboto, sans-serif";

		chart = new Chart(chartCanvas, {
			type: "line",
			data: {
				labels,
				datasets,
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: "bottom",
					},
				},
				scales: {
					y: {
						ticks: {
							callback: (value) => `$${value}`,
						},
					},
				},
			},
		});

	}

	async function refreshSelectedCoins(resetHistory: boolean) {
		const requestId = ++syncRequestId;
		const ids = Array.from(new Set(selectedCoinIds));

		if (ids.length === 0) {
			coins = [];
			priceHistory = {};
			renderChart();
			return;
		}

		const latestCoins = await getCoinsByIds(ids);

		if (requestId !== syncRequestId) {
			return;
		}

		const label = formatLabel(new Date());
		const nextHistory: Record<string, PricePoint[]> = resetHistory ? {} : { ...priceHistory };

		for (const coin of latestCoins) {
			const previousHistory = nextHistory[coin.id] ?? [];
			nextHistory[coin.id] = [...previousHistory, { label, price: coin.price }];
		}

		coins = latestCoins;
		priceHistory = nextHistory;
		renderChart();
	}

	onMount(() => {
		const unsubscribe = selectedCoins.subscribe((coinsValue) => {
			selectedCoinIds = [...coinsValue];
			void refreshSelectedCoins(true);
		});

		const intervalId = window.setInterval(() => {
			void refreshSelectedCoins(false);
		}, POLL_INTERVAL_MS);

		return () => {
			unsubscribe();
			window.clearInterval(intervalId);
			destroyChart();
		};
	});
</script>

<h1>Precios y Datos</h1>

{#if selectedCoinIds.length === 0}
	<p>Selecciona una o más monedas para ver sus precios y el gráfico.</p>
{:else}
	<div class="crypto-data">
		<div class="crypto-table">
			<div class="crypto-table__header" role="row">
				<span role="columnheader">Coin</span>
				<span role="columnheader" class="is-right">Price</span>
				<span role="columnheader" class="is-right">Total Volume</span>
			</div>

			<ul class="crypto-table__body" role="rowgroup">
				{#each coins as coin}
					<li class="crypto-table__row" role="row">
						<div class="crypto-table__coin" role="cell">
							<img class="crypto-table__icon" src={coin.image} alt={coin.name} />
							<div class="crypto-table__coin-text">
								<span class="crypto-table__name">{coin.name}</span>
								<span class="crypto-table__symbol">{coin.symbol.toUpperCase()}</span>
							</div>
						</div>
						<span class="crypto-table__price is-right" role="cell">{formatPrice(coin.price)}</span>
						<span class="crypto-table__volume is-right" role="cell">{formatVolume(coin.totalVolume)}</span>
					</li>
				{/each}
			</ul>
		</div>

		<div class="chart-wrapper">
			<canvas bind:this={chartCanvas}></canvas>
		</div>
	</div>
{/if}

<style>
	.crypto-data {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: min(100%, 1100px);
        padding-bottom: 5rem;
	}

	.crypto-table {
		border: 1px solid rgba(31, 31, 31, 0.12);
		border-radius: 18px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.55);
		box-shadow: 0 12px 30px rgba(31, 31, 31, 0.06);
	}

	.crypto-table__header,
	.crypto-table__row {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(110px, 1fr) minmax(130px, 1fr);
		align-items: center;
		gap: 1rem;
	}

	.crypto-table__header {
		padding: 0.9rem 1rem;
		background: var(--background-dark);
		color: var(--comment);
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.crypto-table__body {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.crypto-table__row {
		padding: 0.95rem 1rem;
		border-top: 1px solid rgba(31, 31, 31, 0.08);
		font-size: 0.98rem;
	}

	.crypto-table__row:hover {
		background: rgba(207, 207, 222, 0.35);
	}

	.crypto-table__coin {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		min-width: 0;
	}

	.crypto-table__icon {
		width: 28px;
		height: 28px;
		flex: 0 0 auto;
	}

	.crypto-table__coin-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.crypto-table__name {
		font-weight: 700;
		line-height: 1.2;
	}

	.crypto-table__symbol {
		font-size: 0.8rem;
		color: var(--comment);
		text-transform: uppercase;
	}

    .crypto-table__price, .crypto-table__volume {
        font-family: "Fira Code", monospace;
    }

	.is-right {
		justify-self: end;
		text-align: right;
	}

	.chart-wrapper {
		height: 320px;
		border: 1px solid rgba(31, 31, 31, 0.12);
		border-radius: 18px;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.45);
		box-shadow: 0 12px 30px rgba(31, 31, 31, 0.06);
	}

	canvas {
		width: 100%;
		height: 100%;
	}

	@media (max-width: 760px) {
		.crypto-table__header,
		.crypto-table__row {
			grid-template-columns: minmax(0, 1.5fr) minmax(90px, 0.8fr) minmax(100px, 0.9fr);
		}

		.crypto-table__header {
			font-size: 0.7rem;
		}
	}

	@media (max-width: 640px) {
		.crypto-table__header {
			display: none;
		}

		.crypto-table__row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.is-right {
			justify-self: start;
			text-align: left;
		}
	}
</style>
