<script lang="ts">
	import { SightingsList, ShareButton, MapPreview } from '@scmascotas/ui';
	import { whatsappUrl as buildWhatsappUrl, googleMapsDirectionsUrl, appleMapsUrl } from '@scmascotas/services/browser';
	import { tileUrl, tileAttribution } from '$lib/client/tiles';
	import { Eye, Pencil, ArrowLeft } from '@lucide/svelte';

	let { data } = $props();
	const pet = $derived(data.pet);
	const sightings = $derived(data.sightings ?? []);

	const siteUrl = $derived(typeof window !== 'undefined' ? window.location.origin : '');

	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };
	const typeLabel: Record<string, string> = { dog: 'Perrito', cat: 'Gatito', other: 'Mascota' };
	const typeLabelArticle: Record<string, string> = { dog: 'Perrito perdido', cat: 'Gatito perdido', other: 'Mascota perdida' };
	const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };
	const sexLabel: Record<string, string> = { male: 'Macho', female: 'Hembra', unknown: 'Desconocido' };

	let activePhoto = $state(0);

	const primaryPhoto = $derived(pet.photos?.[activePhoto]);
	const hasMultiplePhotos = $derived((pet.photos?.length ?? 0) > 1);
	const hasMapLocation = $derived(typeof pet.lat === 'number' && typeof pet.lng === 'number');

	const headline = $derived(
		pet.name
			? `Estamos buscando a ${pet.name}`
			: `${typeLabelArticle[pet.type] ?? 'Mascota perdida'} en ${pet.colonia ?? 'San Cristóbal'}`,
	);

	const whatsappUrl = $derived(
		pet.contactWhatsapp
			? buildWhatsappUrl(
				pet.contactWhatsapp,
				`Hola, vi el reporte de ${pet.name ?? 'tu mascota'} en SC Mascotas y quería darte información.`,
				hasMapLocation ? { lat: pet.lat as number, lng: pet.lng as number } : undefined,
			)
			: null
	);

	type StatusKey = 'missing' | 'reunited' | 'archived';
	const status = $derived((pet.status ?? 'missing') as StatusKey);
	const statusLabel: Record<StatusKey, string> = {
		missing: 'Buscando',
		reunited: 'Reencontrado',
		archived: 'Archivado',
	};

	function formatLongDate(d: string | Date) {
		return new Intl.DateTimeFormat('es-MX', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		}).format(new Date(d));
	}
	function formatRelative(d: string | Date): string {
		const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem.`;
		return `Hace ${Math.floor(diff / 30)} meses`;
	}
</script>

<svelte:head>
	<title>{pet.name ?? typeLabel[pet.type]} — {pet.colonia ?? 'San Cristóbal'} · SC Mascotas</title>
	<meta name="description" content="Reporte de {typeLabel[pet.type] ?? 'mascota'} perdido en {pet.colonia ?? 'San Cristóbal de las Casas'}. Ayuda a regresarlo a casa." />
</svelte:head>

<style>
	@keyframes fade-up {
		from { opacity: 0; transform: translateY(16px); }
		to   { opacity: 1; transform: translateY(0); }
	}
	@keyframes scale-in {
		from { opacity: 0; transform: scale(0.97); }
		to   { opacity: 1; transform: scale(1); }
	}
	@keyframes pulse-ring {
		0%   { transform: scale(0.92); opacity: 0.6; }
		70%  { transform: scale(1.4);  opacity: 0; }
		100% { transform: scale(1.4);  opacity: 0; }
	}
	.reveal { animation: fade-up 0.45s ease both; }
	.reveal-photo { animation: scale-in 0.55s ease both; }
	.pulse-ring {
		isolation: isolate;
	}
	.pulse-ring::before {
		content: '';
		position: absolute;
		inset: -4px;
		border-radius: 9999px;
		background: rgba(217, 119, 6, 0.55);
		animation: pulse-ring 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
		pointer-events: none;
		z-index: 0;
	}
	.pulse-ring > * {
		position: relative;
		z-index: 1;
	}
</style>

<div class="min-h-screen bg-[#fdf8ee] dark:bg-warm-900 bg-dots-amber">

	<div class="max-w-3xl mx-auto px-4 py-10 pb-20">

		<!-- Back nav -->
		<a
			href="/mascotas"
			class="reveal inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium group mb-8"
			style="animation-delay: 0ms"
		>
			<ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
			Volver al listado
		</a>

		<!-- Hero photo -->
		<div
			class="reveal-photo relative rounded-3xl overflow-hidden mb-6 shadow-lg shadow-amber-900/10 dark:shadow-amber-900/30"
			style="animation-delay: 60ms"
		>
			{#if primaryPhoto}
				<div class="aspect-[16/10] sm:aspect-[2/1] bg-amber-50 dark:bg-warm-800">
					<img
						src={primaryPhoto.url}
						alt={pet.name ?? typeLabel[pet.type]}
						class="w-full h-full object-cover"
						loading="eager"
					/>
				</div>
			{:else}
				<!-- No-photo state: large emoji on a soft amber gradient with a paw watermark. -->
				<div class="relative aspect-[16/10] sm:aspect-[2/1] flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100/40 dark:from-amber-900/30 dark:via-warm-800 dark:to-amber-900/20">
					<svg class="absolute -right-10 -bottom-10 w-64 h-64 text-amber-200/40 dark:text-amber-700/15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<circle cx="11" cy="4" r="2"/>
						<circle cx="18" cy="8" r="2"/>
						<circle cx="20" cy="16" r="2"/>
						<circle cx="4" cy="9" r="2"/>
						<path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>
					</svg>
					<div class="relative text-8xl sm:text-9xl drop-shadow-sm">{typeEmoji[pet.type]}</div>
				</div>
			{/if}

			<!-- Status badge top-right -->
			<div class="absolute top-4 right-4">
				{#if status === 'missing'}
					<div class="relative pulse-ring">
						<span class="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-bold tracking-wide shadow-md shadow-amber-700/30">
							<span class="w-1.5 h-1.5 rounded-full bg-amber-200"></span>
							{statusLabel.missing}
						</span>
					</div>
				{:else if status === 'reunited'}
					<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold tracking-wide shadow-md shadow-green-700/30">
						✓ {statusLabel.reunited}
					</span>
				{:else}
					<span class="inline-flex items-center px-3 py-1.5 rounded-full bg-warm-700/85 backdrop-blur text-white text-xs font-bold tracking-wide">
						{statusLabel.archived}
					</span>
				{/if}
			</div>
		</div>

		<!-- Thumbnail strip — only when multiple photos -->
		{#if hasMultiplePhotos}
			<div class="reveal flex gap-2 overflow-x-auto pb-1 mb-6" style="animation-delay: 100ms">
				{#each pet.photos as photo, i (photo.id)}
					<button
						type="button"
						onclick={() => (activePhoto = i)}
						aria-label={`Foto ${i + 1}`}
						aria-pressed={activePhoto === i}
						class="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all {activePhoto === i
							? 'border-amber-500 dark:border-amber-400 shadow-md shadow-amber-500/20 scale-100'
							: 'border-transparent opacity-70 hover:opacity-100 hover:scale-[1.03]'}"
					>
						<img src={photo.url} alt="" class="w-full h-full object-cover" />
					</button>
				{/each}
			</div>
		{/if}

		<!-- Main info card -->
		<div
			class="reveal bg-white dark:bg-warm-800 rounded-3xl border border-amber-200 dark:border-warm-700 border-l-4 border-l-amber-400 shadow-sm mb-4 overflow-hidden"
			style="animation-delay: 140ms"
		>
			<div class="px-5 sm:px-6 pt-5 pb-5">
				<!-- Chip row -->
				<div class="flex flex-wrap items-center gap-1.5 mb-3">
					<span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-semibold">
						<span aria-hidden="true">{typeEmoji[pet.type]}</span>
						{typeLabel[pet.type]}
					</span>
					{#if pet.size}
						<span class="text-[11px] px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-200 font-medium">
							{sizeLabel[pet.size]}
						</span>
					{/if}
					{#if pet.sex && pet.sex !== 'unknown'}
						<span class="text-[11px] px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-200 font-medium">
							{sexLabel[pet.sex]}
						</span>
					{/if}
				</div>

				<!-- Display headline -->
				<h1 class="font-display text-2xl sm:text-3xl font-bold text-warm-900 dark:text-warm-50 leading-snug">
					{headline}
				</h1>

				<!-- Two prominent info cells -->
				<div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#if pet.colonia}
						<div class="bg-amber-50/60 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-800/40 rounded-2xl px-4 py-3">
							<p class="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 mb-1">Colonia</p>
							<p class="text-sm font-semibold text-warm-900 dark:text-warm-50 flex items-center gap-1.5">
								<span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
								{pet.colonia}
							</p>
						</div>
					{/if}
					<div class="bg-amber-50/60 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-800/40 rounded-2xl px-4 py-3">
						<p class="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 mb-1">Último avistamiento</p>
						<p class="text-sm font-semibold text-warm-900 dark:text-warm-50">{formatRelative(pet.lastSeenAt)}</p>
						<p class="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">{formatLongDate(pet.lastSeenAt)}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Secondary attributes card — only if there are extra details to show -->
		{#if pet.color || pet.breed || pet.description}
			<div
				class="reveal bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm mb-4"
				style="animation-delay: 180ms"
			>
				<div class="px-5 sm:px-6 py-5 flex flex-col gap-4">
					{#if pet.color || pet.breed}
						<div class="grid grid-cols-2 gap-3">
							{#if pet.color}
								<div>
									<p class="text-[10px] uppercase tracking-wider font-bold text-warm-500 dark:text-warm-400 mb-1">Color</p>
									<p class="text-sm font-semibold text-warm-900 dark:text-warm-50">{pet.color}</p>
								</div>
							{/if}
							{#if pet.breed}
								<div>
									<p class="text-[10px] uppercase tracking-wider font-bold text-warm-500 dark:text-warm-400 mb-1">Raza</p>
									<p class="text-sm font-semibold text-warm-900 dark:text-warm-50">{pet.breed}</p>
								</div>
							{/if}
						</div>
					{/if}

					{#if pet.description}
						<div class="bg-amber-50/40 dark:bg-amber-900/10 border border-amber-100/70 dark:border-amber-800/30 rounded-2xl p-4">
							<p class="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 mb-2">Descripción</p>
							<p class="text-sm text-warm-700 dark:text-warm-300 leading-relaxed whitespace-pre-line">{pet.description}</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Map preview -->
		{#if hasMapLocation}
			<div class="reveal mb-4" style="animation-delay: 220ms">
				<MapPreview
					lat={pet.lat as number}
					lng={pet.lng as number}
					{tileUrl}
					{tileAttribution}
					precision={pet.locationPrecision}
					googleMapsHref={googleMapsDirectionsUrl(pet.lat as number, pet.lng as number)}
					appleMapsHref={appleMapsUrl(pet.lat as number, pet.lng as number)}
				/>
			</div>
		{/if}

		<!-- Primary contact CTA -->
		{#if !pet.anonymous && whatsappUrl}
			<div class="reveal mb-3" style="animation-delay: 260ms">
				<a
					href={whatsappUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 active:scale-[0.985] text-white font-bold text-base py-4 rounded-2xl transition-all shadow-md shadow-green-200/60 dark:shadow-green-900/30"
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
					</svg>
					{pet.contactName ? `Contactar a ${pet.contactName}` : 'Contactar por WhatsApp'}
				</a>
				{#if pet.contactName}
					<p class="text-[11px] text-warm-500 dark:text-warm-400 text-center mt-2">
						Reportado por {pet.contactName}
					</p>
				{/if}
			</div>
		{/if}

		<!-- Action rail -->
		<div class="reveal flex flex-wrap gap-2" style="animation-delay: 300ms">
			<a
				href="/mascota/{pet.slug}/vista"
				class="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-700 font-semibold text-sm transition-colors"
			>
				<Eye class="w-4 h-4" />
				Vi a esta mascota
			</a>
			<div class="flex-1 min-w-[180px]">
				<ShareButton
					petSlug={pet.slug}
					petName={pet.name}
					petType={pet.type}
					{siteUrl}
					lat={pet.lat}
					lng={pet.lng}
				/>
			</div>
			<a
				href="/mascota/{pet.slug}/editar"
				class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700/60 hover:border-warm-300 dark:hover:border-warm-600 font-semibold text-sm transition-colors"
				aria-label="Editar reporte"
			>
				<Pencil class="w-4 h-4" />
				<span class="hidden sm:inline">Editar</span>
			</a>
		</div>

		<!-- Sightings -->
		{#if sightings.length > 0}
			<section class="reveal mt-12" style="animation-delay: 360ms">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 flex items-center justify-center">
						<Eye class="w-4 h-4 text-teal-700 dark:text-teal-400" />
					</div>
					<div>
						<p class="text-[10px] uppercase tracking-wider font-bold text-teal-700 dark:text-teal-400">Avistamientos</p>
						<h2 class="font-display text-xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
							La comunidad ha visto a {pet.name ?? 'esta mascota'}
						</h2>
					</div>
				</div>
				<SightingsList {sightings} reportHref="/mascota/{pet.slug}/vista" />
			</section>
		{:else}
			<section class="reveal mt-10 pt-8 border-t border-warm-200/60 dark:border-warm-700/60 text-center" style="animation-delay: 360ms">
				<p class="text-sm text-warm-500 dark:text-warm-400 mb-3">
					¿La has visto? Ayuda a regresarla a casa.
				</p>
				<a
					href="/mascota/{pet.slug}/vista"
					class="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-md shadow-teal-700/20 transition-colors"
				>
					<Eye class="w-4 h-4" />
					Vi a esta mascota
				</a>
			</section>
		{/if}
	</div>
</div>
