<script lang="ts">
	import { Progress, Card } from '@scmascotas/ui';

	const TOTAL_PHASES = 8;
	const DONE_PHASES = 7;
	const progress = Math.round((DONE_PHASES / TOTAL_PHASES) * 100);
</script>

<svelte:head>
	<title>Plan de ruta — SC Mascotas</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-16">
	<a href="/" class="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 transition-colors">← Volver</a>

	<h1 class="font-display text-3xl font-bold text-brand-900 dark:text-brand-300 mt-6 mb-2">Plan de ruta</h1>
	<p class="text-warm-500 dark:text-warm-400 mb-6">
		Qué hemos construido, qué viene en los próximos sprints y hacia dónde va SC Mascotas.
	</p>

	<!-- v1.0 progress -->
	<div class="mb-12 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 px-5 py-4">
		<div class="flex items-baseline justify-between mb-2">
			<span class="text-sm font-semibold text-brand-800 dark:text-brand-300">Progreso hacia v1.0</span>
			<span class="text-xs font-mono text-brand-700 dark:text-brand-400">{DONE_PHASES} de {TOTAL_PHASES} fases</span>
		</div>
		<Progress.Root
			value={progress}
			max={100}
			class="bg-brand-200 dark:bg-brand-800"
			indicatorClass="bg-brand-700 dark:bg-brand-400"
		/>
		<p class="text-xs text-brand-600 dark:text-brand-400 mt-2">{progress}% completado</p>
	</div>

	<!-- Completado -->
	<section class="mb-12">
		<h2 class="font-display text-lg font-bold text-warm-400 dark:text-warm-500 uppercase tracking-wider mb-6">
			Completado
		</h2>
		<div class="flex flex-col gap-4">
			<Card.Root class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
				<Card.Content class="pt-5 pb-5">
					<div class="flex items-start gap-3">
						<span class="text-lg mt-0.5">✅</span>
						<div>
							<p class="font-semibold text-warm-800 dark:text-warm-100">Fase 1 — Infraestructura open-source</p>
							<p class="text-sm text-warm-500 dark:text-warm-400 mt-1">
								Repositorio público con licencia MIT, monorepo Turborepo, CI con GitHub Actions, semilla de
								colonias, entorno nightly con datos de prueba.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
				<Card.Content class="pt-5 pb-5">
					<div class="flex items-start gap-3">
						<span class="text-lg mt-0.5">✅</span>
						<div>
							<p class="font-semibold text-warm-800 dark:text-warm-100">Fase 2 — Reporte y exploración básica</p>
							<p class="text-sm text-warm-500 dark:text-warm-400 mt-1">
								Cualquier persona puede reportar una mascota perdida de forma anónima con token de edición.
								Galería pública, página de detalle, subida de fotos a Vercel Blob, analítica.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
				<Card.Content class="pt-5 pb-5">
					<div class="flex items-start gap-3">
						<span class="text-lg mt-0.5">✅</span>
						<div>
							<p class="font-semibold text-warm-800 dark:text-warm-100">Fase 3 — Autenticación</p>
							<p class="text-sm text-warm-500 dark:text-warm-400 mt-1">
								Inicio de sesión con correo, Google y passkeys. Llaves de API para la futura app móvil.
								Los reportes anónimos del pasado se pueden reclamar al crear cuenta.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
				<Card.Content class="pt-5 pb-5">
					<div class="flex items-start gap-3">
						<span class="text-lg mt-0.5">✅</span>
						<div>
							<p class="font-semibold text-warm-800 dark:text-warm-100">Fase 4 — Avistamientos, edición y compartir</p>
							<p class="text-sm text-warm-500 dark:text-warm-400 mt-1">
								Cualquier persona puede reportar que vio a la mascota. Los avistamientos actualizan la fecha de último avistamiento. Botón de compartir a Facebook. Filtros por especie y colonia en la galería y portada. Marcar como reencontrada.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
				<Card.Content class="pt-5 pb-5">
					<div class="flex items-start gap-3">
						<span class="text-lg mt-0.5">✅</span>
						<div>
							<p class="font-semibold text-warm-800 dark:text-warm-100">Fase 5 — Emparejamiento estructurado</p>
							<p class="text-sm text-warm-500 dark:text-warm-400 mt-1">
								Los avistamientos sugieren automáticamente mascotas perdidas con perfil similar usando un algoritmo de puntuación por especie, colonia, color, tamaño y recencia. El algoritmo usa grupos de sinónimos de color en español, es de código abierto y acepta contribuciones de la comunidad.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
				<Card.Content class="pt-5 pb-5">
					<div class="flex items-start gap-3">
						<span class="text-lg mt-0.5">✅</span>
						<div>
							<p class="font-semibold text-warm-800 dark:text-warm-100">Fase 6 — Similitud visual por imagen</p>
							<p class="text-sm text-warm-500 dark:text-warm-400 mt-1">
								Embeddings de imagen con Replicate (CLIP ViT-L/14) almacenados en pgvector. Se generan de forma asíncrona tras cada subida de foto y se incorporan al algoritmo de emparejamiento como señal visual (0–20 pts por similitud coseno). Solo se ejecutan en candidatos activos para mantener costos bajos.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
				<Card.Content class="pt-5 pb-5">
					<div class="flex items-start gap-3">
						<span class="text-lg mt-0.5">✅</span>
						<div>
							<p class="font-semibold text-warm-800 dark:text-warm-100">Fase 7 — Mapas y geografía</p>
							<p class="text-sm text-warm-500 dark:text-warm-400 mt-1">
								Mapa interactivo de San Cristóbal con PostGIS + Leaflet y tiles de Stadia Maps. Al reportar una mascota perdida o un avistamiento se puede marcar el punto exacto arrastrando un pin. Las páginas de detalle muestran un mapa pequeño con botón "Cómo llegar" que abre Google Maps en Android y Apple Maps en iPhone. La distancia geográfica se suma al algoritmo de emparejamiento (0–20 pts por proximidad). Filtro por especie y tiempo en /mapa.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- Próximamente -->
	<section class="mb-12">
		<h2 class="font-display text-lg font-bold text-warm-400 dark:text-warm-500 uppercase tracking-wider mb-6">
			Próximamente
		</h2>
		<div class="flex flex-col gap-4">
			{#each [
				{ icon: '⏳', title: 'Fase 8 — PWA, moderación y lanzamiento', desc: 'Instalable como app en celular (PWA). Panel de moderación. Seguimiento de errores con Sentry. Pruebas en dispositivos reales con datos móviles lentos. Contacto con los admins del grupo de Facebook. Lanzamiento suave.' },
			] as sprint (sprint.title)}
				<Card.Root class="border-warm-200 dark:border-warm-700">
					<Card.Content class="pt-5 pb-5">
						<div class="flex items-start gap-3">
							<span class="text-lg mt-0.5">{sprint.icon}</span>
							<div>
								<p class="font-semibold text-warm-800 dark:text-warm-100">{sprint.title}</p>
								<p class="text-sm text-warm-500 dark:text-warm-400 mt-1">{sprint.desc}</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</section>

	<!-- Fases futuras -->
	<section>
		<h2 class="font-display text-lg font-bold text-warm-400 dark:text-warm-500 uppercase tracking-wider mb-6">
			Fases futuras
		</h2>
		<div class="flex flex-col gap-3">
			{#each [
				{ icon: '📱', title: 'App móvil nativa', desc: 'Capacitor con SvelteKit en modo SPA. Reutiliza los paquetes `@scmascotas/ui` y `@scmascotas/schemas`. Autenticación vía llaves de API.' },
				{ icon: '🔔', title: 'Notificaciones push', desc: 'Web Push para avisar al dueño cuando alguien reporta haber visto a su mascota o cuando el algoritmo encuentra una coincidencia.' },
				{ icon: '🌆', title: 'Soporte multi-ciudad', desc: 'Refactorizar el supuesto de "San Cristóbal" para que cualquier ciudad pueda hacer fork y desplegar su propia instancia.' },
			] as phase (phase.title)}
				<div class="flex items-start gap-3 p-4 rounded-lg bg-warm-50 dark:bg-warm-800 border border-warm-100 dark:border-warm-700">
					<span class="text-base mt-0.5">{phase.icon}</span>
					<div>
						<p class="font-medium text-warm-700 dark:text-warm-200 text-sm">{phase.title}</p>
						<p class="text-xs text-warm-400 dark:text-warm-500 mt-0.5">{phase.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<div class="mt-16 pt-8 border-t border-warm-100 dark:border-warm-700 text-center">
		<p class="text-sm text-warm-400 dark:text-warm-500">
			¿Tienes ideas o quieres contribuir?
			<a
				href="https://github.com/jesuscovam/scmascotas"
				target="_blank"
				rel="noopener noreferrer"
				class="text-brand-700 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-200 underline"
			>
				Abre un issue en GitHub
			</a>
		</p>
	</div>
</div>
