<script lang="ts">
	// No script needed — purely presentational navigation
</script>

<svelte:head>
	<title>Reportar — SC Mascotas</title>
	<meta name="description" content="¿Perdiste a tu mascota o viste una mascota perdida en San Cristóbal de las Casas? Reporta aquí." />
</svelte:head>

<div
	class="min-h-screen bg-[#faf9f7] dark:bg-warm-900 flex flex-col bg-dots-amber"
>
	<!-- Back link -->
	<div class="px-6 pt-6">
		<a
			href="/"
			class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Volver al inicio
		</a>
	</div>

	<!-- Main content -->
	<div class="flex-1 flex flex-col items-center justify-start px-4 pt-8 pb-12 sm:pt-10 sm:pb-16">

		<!-- Header -->
		<div class="text-center mb-10 flex flex-col items-center gap-3">
			<span class="inline-flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-full px-3 py-1">
				<svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
				</svg>
				San Cristóbal de las Casas
			</span>

			<h1 class="font-display text-4xl sm:text-5xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
				¿Qué pasó?
			</h1>
			<p class="text-warm-500 dark:text-warm-400 text-base max-w-sm">
				Cuéntanos, te ayudamos a conectar con la comunidad.
			</p>
		</div>

		<!-- Cards -->
		<div class="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">

			<!-- Card A: Lost pet -->
			<a
				href="/reportar/mascota"
				class="group relative flex flex-col gap-4 bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-3xl p-7 min-h-[200px] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
			>
				<!-- Accent strip top -->
				<div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-t-3xl"></div>

				<!-- Background glow -->
				<div class="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent dark:from-amber-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>

				<div class="relative">
					<span class="text-4xl leading-none select-none">🐾</span>
				</div>

				<div class="relative flex-1 flex flex-col justify-between gap-6">
					<div class="flex flex-col gap-1.5">
						<h2 class="font-display text-xl font-bold text-warm-900 dark:text-warm-50 leading-snug">
							Perdí a mi mascota
						</h2>
						<p class="text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
							Publica un reporte para que la comunidad te ayude a encontrarla.
						</p>
					</div>

					<span class="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400 group-hover:gap-2.5 transition-all">
						Publicar reporte
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</span>
				</div>
			</a>

			<!-- Card B: Sighting -->
			<a
				href="/reportar/vi"
				class="group relative flex flex-col gap-4 bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-3xl p-7 min-h-[200px] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
			>
				<!-- Accent strip top -->
				<div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 to-green-500 rounded-t-3xl"></div>

				<!-- Background glow -->
				<div class="absolute inset-0 bg-gradient-to-br from-teal-50/60 to-transparent dark:from-teal-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>

				<div class="relative">
					<span class="text-4xl leading-none select-none">👀</span>
				</div>

				<div class="relative flex-1 flex flex-col justify-between gap-6">
					<div class="flex flex-col gap-1.5">
						<h2 class="font-display text-xl font-bold text-warm-900 dark:text-warm-50 leading-snug">
							Vi una mascota perdida
						</h2>
						<p class="text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
							Dinos dónde y te mostramos los reportes activos en esa zona.
						</p>
					</div>

					<span class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 dark:text-teal-400 group-hover:gap-2.5 transition-all">
						Reportar avistamiento
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</span>
				</div>
			</a>
		</div>

		<!-- Footer note -->
		<p class="mt-8 text-xs text-warm-400 dark:text-warm-500 text-center max-w-xs">
			Cada reporte ayuda a la comunidad de San Cristóbal a reunir familias con sus mascotas. 🐾
		</p>
	</div>
</div>
