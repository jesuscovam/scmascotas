<script lang="ts">
	import { Button, Badge } from '@scmascotas/ui';
	import AlphaBanner from '$lib/components/AlphaBanner.svelte';
	let { data } = $props();

	const speciesLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };
	const typeTopBorder: Record<string, string> = {
		dog: 'border-t-amber-400',
		cat: 'border-t-teal-400',
		other: 'border-t-stone-400'
	};
	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };
	const typeLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };

	function timeAgo(date: string | Date): string {
		const d = new Date(date);
		const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem.`;
		return `Hace ${Math.floor(diff / 30)} meses`;
	}

	const PREVIEW_LIMIT = 4;
	const petPreview = $derived(data.pets.slice(0, PREVIEW_LIMIT));
	const hasMorePets = $derived(data.pets.length > PREVIEW_LIMIT);
	const sightingPreview = $derived(data.sightings.slice(0, PREVIEW_LIMIT));
	const hasMoreSightings = $derived(data.sightings.length > PREVIEW_LIMIT);

	let contactName = $state('');
	let contactEmail = $state('');
	let contactMessage = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let formError = $state('');

	async function handleContact(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		formError = '';
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage })
			});
			if (!res.ok) {
				if (res.status === 429) {
					formError = 'Demasiados mensajes. Intenta de nuevo mañana.';
				} else {
					formError = (await res.text()) || 'Hubo un error al enviar tu mensaje.';
				}
				return;
			}
			submitted = true;
		} catch {
			formError = 'Hubo un error al enviar tu mensaje.';
		} finally {
			submitting = false;
		}
	}
</script>

<!-- Hero -->
<section class="bg-white dark:bg-warm-900 border-b border-warm-200 dark:border-warm-700">
	<div class="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
		<div class="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-sm font-semibold px-3 py-1 rounded-full border border-brand-200 dark:border-brand-700">
			<span>San Cristóbal de las Casas, Chiapas</span>
		</div>
		<h1 class="font-display text-4xl sm:text-5xl font-bold text-warm-900 dark:text-warm-50 leading-tight max-w-2xl">
			¿Perdiste a tu<br />
			<span class="text-brand-800 dark:text-brand-300">mascota?</span>
		</h1>
		<p class="text-warm-500 dark:text-warm-400 text-lg max-w-md">
			Publica un reporte en segundos, sin necesidad de crear una cuenta. La comunidad de San Cristóbal puede ayudarte.
		</p>
		<Button.Root
			href="/reportar"
			class="text-lg px-8 py-4 rounded-2xl hover:scale-105 shadow-md hover:shadow-lg h-auto"
		>
			Reportar mascota perdida →
		</Button.Root>
	</div>
</section>

<!-- Cómo funciona -->
<section class="bg-warm-900 border-y border-warm-800 py-16">
	<div class="max-w-5xl mx-auto px-4">

		<div class="text-center mb-12">
			<p class="text-brand-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Así funciona</p>
			<h2 class="font-display text-3xl sm:text-4xl font-bold text-warm-50">
				De reporte a <span class="text-brand-400">reencuentro</span>
			</h2>
			<p class="text-warm-400 mt-4 max-w-md mx-auto text-sm leading-relaxed">
				Cuatro pasos para que la comunidad de San Cristóbal te ayude a encontrar a tu mascota.
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3">

			<!-- Step 1 -->
			<div class="relative bg-warm-800 border border-warm-700 rounded-2xl p-6 border-l-4 border-l-brand-600 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div class="w-8 h-8 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-brand-300 text-sm font-bold font-display">1</div>
					<span class="text-2xl">📸</span>
				</div>
				<div>
					<h3 class="font-display font-bold text-warm-50 text-base leading-snug mb-2">
						Publica el reporte
					</h3>
					<p class="text-warm-400 text-xs leading-relaxed">
						Sube una foto, describe a tu mascota y la última ubicación donde fue vista. Sin cuenta necesaria.
					</p>
				</div>
				<!-- Desktop arrow -->
				<div class="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 items-center">
					<svg width="24" height="16" viewBox="0 0 24 16" fill="none" class="text-warm-600">
						<path d="M0 8 H18 M14 3 L20 8 L14 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 2"/>
					</svg>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="relative bg-warm-800 border border-warm-700 rounded-2xl p-6 border-l-4 border-l-brand-600 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div class="w-8 h-8 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-brand-300 text-sm font-bold font-display">2</div>
					<span class="text-2xl">🤝</span>
				</div>
				<div>
					<h3 class="font-display font-bold text-warm-50 text-base leading-snug mb-2">
						La comunidad se entera
					</h3>
					<p class="text-warm-400 text-xs leading-relaxed">
						El reporte es visible para vecinos de San Cristóbal que puedan ayudarte a localizarla.
					</p>
				</div>
				<!-- Desktop arrow -->
				<div class="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 items-center">
					<svg width="24" height="16" viewBox="0 0 24 16" fill="none" class="text-warm-600">
						<path d="M0 8 H18 M14 3 L20 8 L14 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 2"/>
					</svg>
				</div>
			</div>

			<!-- Step 3 — Coming soon -->
			<div class="relative bg-warm-900/60 border-2 border-dashed border-warm-700 rounded-2xl p-6 flex flex-col gap-4 opacity-75">
				<div class="flex items-center justify-between">
					<div class="w-8 h-8 rounded-full bg-warm-800 border border-warm-700 flex items-center justify-center text-warm-500 text-sm font-bold font-display">3</div>
					<span class="text-2xl grayscale">🗺️</span>
				</div>
				<div>
					<div class="inline-flex items-center gap-1 bg-warm-800 text-warm-500 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
						Próximamente
					</div>
					<h3 class="font-display font-bold text-warm-300 text-base leading-snug mb-2">
						Reportes en el mapa
					</h3>
					<p class="text-warm-500 text-xs leading-relaxed">
						Un mapa interactivo mostrará todos los reportes activos cerca de ti en tiempo real.
					</p>
				</div>
				<!-- Desktop arrow -->
				<div class="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 items-center">
					<svg width="24" height="16" viewBox="0 0 24 16" fill="none" class="text-warm-700">
						<path d="M0 8 H18 M14 3 L20 8 L14 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 2"/>
					</svg>
				</div>
			</div>

			<!-- Step 4 — Coming soon -->
			<div class="bg-warm-900/60 border-2 border-dashed border-warm-700 rounded-2xl p-6 flex flex-col gap-4 opacity-75">
				<div class="flex items-center justify-between">
					<div class="w-8 h-8 rounded-full bg-warm-800 border border-warm-700 flex items-center justify-center text-warm-500 text-sm font-bold font-display">4</div>
					<span class="text-2xl grayscale">🔍</span>
				</div>
				<div>
					<div class="inline-flex items-center gap-1 bg-warm-800 text-warm-500 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
						Próximamente
					</div>
					<h3 class="font-display font-bold text-warm-300 text-base leading-snug mb-2">
						Comparación por imagen
					</h3>
					<p class="text-warm-500 text-xs leading-relaxed">
						Sube una foto de una mascota encontrada y el sistema la comparará con los reportes activos.
					</p>
				</div>
			</div>

		</div>
	</div>
</section>

<!-- Listings -->
<section class="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-14">
	<div class="mb-2">
		<AlphaBanner />
	</div>

	<!-- ── Missing pets ── -->
	<div>
		<div class="flex items-center justify-between mb-4 gap-3">
			<div class="flex items-center gap-2.5">
				<span class="text-xl">🐾</span>
				<h2 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50">
					Mascotas perdidas
				</h2>
				{#if data.pets.length > 0}
					<span class="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full">
						{data.pets.length}
					</span>
				{/if}
			</div>
			<a href="/mascotas" class="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors">
				Ver todas →
			</a>
		</div>

		{#if data.pets.length === 0}
			<div class="rounded-2xl border border-dashed border-warm-200 dark:border-warm-700 py-12 flex flex-col items-center gap-3 text-center">
				<span class="text-4xl">🐾</span>
				<p class="text-warm-500 dark:text-warm-400 text-sm">No hay reportes activos por ahora.</p>
				<a href="/reportar" class="text-amber-700 dark:text-amber-400 font-semibold text-sm hover:underline">
					Publicar un reporte →
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{#each petPreview as pet (pet.id)}
					<a
						href="/mascota/{pet.slug}"
						class="group bg-white dark:bg-warm-800 rounded-2xl border border-warm-200 dark:border-warm-700 border-t-4 {typeTopBorder[pet.type] ?? 'border-t-stone-400'} shadow-sm hover:shadow-md hover:scale-[1.02] transition-all overflow-hidden flex flex-col"
					>
						{#if pet.photoUrl}
							<div class="aspect-[4/3] overflow-hidden shrink-0">
								<img src={pet.photoUrl} alt={pet.name ?? 'Mascota'} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
							</div>
						{:else}
							<div class="aspect-[4/3] shrink-0 relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-100/50 to-warm-50 dark:from-warm-700 dark:via-warm-700/60 dark:to-warm-800 flex items-center justify-center">
								<div class="absolute inset-0 opacity-25" style="background-image: radial-gradient(circle, #d97706 1px, transparent 1px); background-size: 14px 14px;"></div>
								<span class="text-4xl drop-shadow-sm relative z-10">{typeEmoji[pet.type] ?? '🐾'}</span>
							</div>
						{/if}
						<div class="p-3 flex flex-col gap-2 flex-1">
							<div class="flex items-start justify-between gap-1.5">
								<h3 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-sm leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors line-clamp-2">
									{pet.name ?? 'Sin nombre'}
								</h3>
								<Badge.Root variant="amber" class="shrink-0 !text-[10px] !px-1.5 !py-0 ml-1">
									{speciesLabel[pet.type] ?? pet.type}
								</Badge.Root>
							</div>
							{#if pet.color || pet.size}
								<div class="flex flex-wrap gap-1 text-[11px] text-warm-500 dark:text-warm-400">
									{#if pet.color}<span class="bg-warm-100 dark:bg-warm-700 px-1.5 py-px rounded-full">{pet.color}</span>{/if}
									{#if pet.size}<span class="bg-warm-100 dark:bg-warm-700 px-1.5 py-px rounded-full">{sizeLabel[pet.size]}</span>{/if}
								</div>
							{/if}
							<div class="mt-auto pt-2 border-t border-warm-100 dark:border-warm-700 flex items-center justify-between gap-1 text-[11px] text-warm-400 dark:text-warm-500">
								<span class="flex items-center gap-1 min-w-0">
									<span class="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-300 dark:bg-amber-700"></span>
									<span class="truncate">{pet.colonia ?? 'Desconocida'}</span>
								</span>
								<span class="shrink-0">{timeAgo(pet.lastSeenAt)}</span>
							</div>
						</div>
					</a>
				{/each}

				{#if hasMorePets}
					<a
						href="/mascotas"
						class="group rounded-2xl border-2 border-dashed border-warm-200 dark:border-warm-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all flex flex-col items-center justify-center gap-2 p-4 text-center aspect-[4/3]"
					>
						<span class="text-2xl">🐾</span>
						<p class="text-xs font-semibold text-warm-500 dark:text-warm-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
							+{data.pets.length - PREVIEW_LIMIT} más
						</p>
						<span class="text-[11px] font-bold text-amber-600 dark:text-amber-500 group-hover:underline">Ver todas →</span>
					</a>
				{/if}
			</div>
		{/if}
	</div>

	<!-- ── Spotted pets ── -->
	<div>
		<div class="flex items-center justify-between mb-4 gap-3">
			<div class="flex items-center gap-2.5">
				<span class="text-xl">👀</span>
				<h2 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50">
					Avistamientos recientes
				</h2>
				{#if data.sightings.length > 0}
					<span class="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 border border-teal-300 dark:border-teal-700 px-2 py-0.5 rounded-full">
						{data.sightings.length}
					</span>
				{/if}
			</div>
			<a href="/avistamientos" class="shrink-0 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 transition-colors">
				Ver todos →
			</a>
		</div>

		{#if data.sightings.length === 0}
			<div class="rounded-2xl border border-dashed border-teal-200 dark:border-teal-800 py-12 flex flex-col items-center gap-3 text-center bg-teal-50/30 dark:bg-teal-900/5">
				<span class="text-4xl">👀</span>
				<p class="text-warm-500 dark:text-warm-400 text-sm">¿Viste una mascota perdida?</p>
				<a href="/reportar/vi" class="text-teal-700 dark:text-teal-400 font-semibold text-sm hover:underline">
					Sé el primero en reportarlo →
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{#each sightingPreview as s (s.id)}
					<div class="group bg-white dark:bg-warm-800 rounded-2xl border border-warm-200 dark:border-warm-700 border-l-4 border-l-teal-400 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all overflow-hidden flex flex-col">
						{#if s.photoUrl}
							<div class="aspect-[4/3] overflow-hidden shrink-0 relative">
								<img src={s.photoUrl} alt="Avistamiento" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
								<span class="absolute top-2 left-2 text-[11px] font-bold text-teal-800 dark:text-teal-200 bg-teal-100/90 dark:bg-teal-900/80 backdrop-blur-sm border border-teal-200 dark:border-teal-700 px-1.5 py-px rounded-full">
									{typeEmoji[s.type]} {typeLabel[s.type] ?? s.type}
								</span>
							</div>
						{:else}
							<div class="aspect-[4/3] shrink-0 relative overflow-hidden bg-gradient-to-br from-teal-50 via-teal-100/40 to-warm-50 dark:from-teal-900/30 dark:via-teal-900/20 dark:to-warm-800 flex items-center justify-center">
								<div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle, #0d9488 1px, transparent 1px); background-size: 14px 14px;"></div>
								<span class="text-4xl drop-shadow-sm relative z-10">{typeEmoji[s.type] ?? '🐾'}</span>
								<span class="absolute top-2 left-2 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-700 px-1.5 py-px rounded-full">
									{typeLabel[s.type] ?? s.type}
								</span>
							</div>
						{/if}
						<div class="p-3 flex flex-col gap-2 flex-1">
							{#if s.photoUrl}
								<span class="text-xs font-semibold text-teal-700 dark:text-teal-400">{typeLabel[s.type] ?? s.type}</span>
							{/if}
							{#if s.description}
								<p class="text-[11px] text-warm-600 dark:text-warm-300 leading-relaxed line-clamp-3">{s.description}</p>
							{:else}
								<p class="text-[11px] text-warm-400 dark:text-warm-500 italic">Sin descripción.</p>
							{/if}
							{#if s.color || s.size}
								<div class="flex flex-wrap gap-1 text-[11px] text-warm-500 dark:text-warm-400">
									{#if s.color}<span class="bg-warm-100 dark:bg-warm-700 px-1.5 py-px rounded-full">{s.color}</span>{/if}
									{#if s.size}<span class="bg-warm-100 dark:bg-warm-700 px-1.5 py-px rounded-full">{sizeLabel[s.size]}</span>{/if}
								</div>
							{/if}
							<div class="mt-auto pt-2 border-t border-warm-100 dark:border-warm-700 flex items-center justify-between gap-1 text-[11px] text-warm-400 dark:text-warm-500">
								<span class="flex items-center gap-1 min-w-0">
									<span class="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-300 dark:bg-teal-700"></span>
									<span class="truncate">{s.colonia ?? 'Desconocida'}</span>
								</span>
								<span class="shrink-0">{timeAgo(s.createdAt)}</span>
							</div>
						</div>
					</div>
				{/each}

				{#if hasMoreSightings}
					<a
						href="/avistamientos"
						class="group rounded-2xl border-2 border-dashed border-warm-200 dark:border-warm-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all flex flex-col items-center justify-center gap-2 p-4 text-center aspect-[4/3]"
					>
						<span class="text-2xl">👀</span>
						<p class="text-xs font-semibold text-warm-500 dark:text-warm-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
							+{data.sightings.length - PREVIEW_LIMIT} más
						</p>
						<span class="text-[11px] font-bold text-teal-600 dark:text-teal-500 group-hover:underline">Ver todos →</span>
					</a>
				{/if}
			</div>
		{/if}
	</div>

</section>

<!-- Tablero comunitario -->
<section
	class="relative overflow-hidden border-y border-amber-800/20 py-12"
	style="background-color:#b5763a; background-image:radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px), radial-gradient(circle at 10px 10px, rgba(255,255,255,0.04) 1px, transparent 1px); background-size:18px 18px, 18px 18px;"
>
	<!-- Vignette overlay -->
	<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>

	<div class="relative max-w-5xl mx-auto px-4">
		<p class="text-center text-[11px] font-bold text-amber-200/70 uppercase tracking-[0.2em] mb-10">
			Tablero del proyecto
		</p>

		<div class="flex flex-col sm:flex-row justify-center gap-12 items-start">

			<!-- Cambios -->
			<a
				href="/cambios"
				class="group relative w-full max-w-[250px] mx-auto pt-8 pb-6 px-6
					bg-[#fffef0] shadow-[4px_8px_28px_rgba(0,0,0,0.35)]
					[transform:rotate(-2.5deg)] hover:[transform:rotate(0deg)_translateY(-6px)]
					transition-all duration-300 ease-out"
			>
				<!-- Pin -->
				<div class="absolute -top-[18px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
					<div class="w-7 h-7 rounded-full bg-brand-800 border-[3px] border-brand-900 shadow-[0_3px_8px_rgba(0,0,0,0.4)] flex items-center justify-center">
						<div class="w-2 h-2 rounded-full bg-amber-200 opacity-80"></div>
					</div>
					<div class="w-px h-3 bg-brand-900/40"></div>
				</div>

				<!-- Ruled lines decoration -->
				<div class="absolute inset-x-0 top-14 bottom-0 overflow-hidden opacity-[0.06] pointer-events-none">
					{#each Array(8) as _el, i (i)}
						<div class="w-full border-b border-blue-900" style="margin-top: {i === 0 ? 24 : 0}px; height: 24px;"></div>
					{/each}
				</div>

				<div class="relative">
					<div class="text-2xl mb-3">📋</div>
					<h3 class="font-display font-bold text-warm-900 text-[17px] leading-tight mb-2">
						Historial de cambios
					</h3>
					<p class="text-xs text-warm-500 leading-relaxed">
						Ve qué hay de nuevo en cada versión
					</p>
					<div class="mt-5 text-[11px] font-bold text-brand-800 tracking-wide group-hover:underline">
						Ver historial →
					</div>
				</div>
			</a>

			<!-- Plan de ruta -->
			<a
				href="/plan"
				class="group relative w-full max-w-[250px] mx-auto pt-8 pb-6 px-6
					bg-[#f4fef6] shadow-[4px_8px_28px_rgba(0,0,0,0.35)]
					[transform:rotate(2deg)] hover:[transform:rotate(0deg)_translateY(-6px)]
					transition-all duration-300 ease-out"
			>
				<!-- Pin -->
				<div class="absolute -top-[18px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
					<div class="w-7 h-7 rounded-full bg-teal-700 border-[3px] border-teal-800 shadow-[0_3px_8px_rgba(0,0,0,0.4)] flex items-center justify-center">
						<div class="w-2 h-2 rounded-full bg-teal-200 opacity-80"></div>
					</div>
					<div class="w-px h-3 bg-teal-900/40"></div>
				</div>

				<!-- Ruled lines decoration -->
				<div class="absolute inset-x-0 top-14 bottom-0 overflow-hidden opacity-[0.06] pointer-events-none">
					{#each Array(8) as _el, i (i)}
						<div class="w-full border-b border-blue-900" style="margin-top: {i === 0 ? 24 : 0}px; height: 24px;"></div>
					{/each}
				</div>

				<div class="relative">
					<div class="text-2xl mb-3">🗺️</div>
					<h3 class="font-display font-bold text-warm-900 text-[17px] leading-tight mb-2">
						Plan de ruta
					</h3>
					<p class="text-xs text-warm-500 leading-relaxed">
						Conoce lo que viene en los próximos cambios
					</p>
					<div class="mt-5 text-[11px] font-bold text-teal-700 tracking-wide group-hover:underline">
						Ver plan →
					</div>
				</div>
			</a>

		</div>
	</div>
</section>

<!-- Contact / Suggestions -->
<section class="relative py-14 overflow-hidden">
	<div class="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-warm-50 to-warm-50/0 dark:from-amber-900/10 dark:via-warm-900/40 dark:to-transparent pointer-events-none"></div>
	<div class="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl pointer-events-none"></div>
	<div class="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-orange-100/30 dark:bg-orange-900/10 blur-3xl pointer-events-none"></div>

	<div class="relative max-w-2xl mx-auto px-4">
		{#if submitted}
			<div class="text-center py-10 flex flex-col items-center gap-5">
				<div class="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shadow-inner">
					<svg class="w-10 h-10 text-amber-600 dark:text-amber-400" viewBox="0 0 40 40" fill="none">
						<path d="M8 21l8 8L32 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="flex flex-col gap-1.5">
					<h3 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50">¡Gracias por escribirnos!</h3>
					<p class="text-warm-500 dark:text-warm-400 text-sm max-w-sm mx-auto leading-relaxed">
						Tu mensaje llegó. Lo leeremos con atención y te responderemos si dejaste tu correo.
					</p>
				</div>
				<span class="text-3xl select-none" aria-hidden="true">🐾</span>
			</div>
		{:else}
			<div class="text-center mb-5">
				<div class="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-4">
					<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M2 4h12v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"/><path d="M2 4l6 5 6-5"/>
					</svg>
					Contacto
				</div>
				<h2 class="font-display text-3xl sm:text-4xl font-bold text-warm-900 dark:text-warm-50 leading-tight mb-3">
					¿Tienes una sugerencia?
				</h2>
				<p class="text-warm-500 dark:text-warm-400 text-base leading-relaxed max-w-md mx-auto">
					Cuéntanos qué mejorarías, qué te falta o simplemente saluda.
					Para bugs y funciones nuevas, usa
					<a href="https://github.com/jesuscovam/scmascotas/issues" target="_blank" rel="noopener noreferrer"
						class="text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-300 transition-colors">
						GitHub Issues
					</a>.
				</p>
			</div>

			<div class="bg-white dark:bg-warm-800 rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.3)] border border-warm-100 dark:border-warm-700 p-6 sm:p-8">
				<form onsubmit={handleContact} class="flex flex-col gap-5">
					<div class="grid sm:grid-cols-2 gap-5">
						<div class="flex flex-col gap-1.5">
							<label for="contact-name" class="text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
								Nombre <span class="text-amber-500">*</span>
							</label>
							<input
								id="contact-name"
								type="text"
								bind:value={contactName}
								placeholder="Tu nombre"
								required
								class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent transition-all"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label for="contact-email" class="text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
								Correo <span class="text-warm-400 font-normal normal-case tracking-normal">(opcional)</span>
							</label>
							<input
								id="contact-email"
								type="email"
								bind:value={contactEmail}
								placeholder="para responderte"
								class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent transition-all"
							/>
						</div>
					</div>

					<div class="flex flex-col gap-1.5">
						<label for="contact-message" class="text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
							Mensaje <span class="text-amber-500">*</span>
						</label>
						<textarea
							id="contact-message"
							bind:value={contactMessage}
							placeholder="Tu sugerencia, idea o comentario…"
							required
							rows="4"
							class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent transition-all resize-none leading-relaxed"
						></textarea>
					</div>

					{#if formError}
						<p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
							{formError}
						</p>
					{/if}

					<div class="flex items-center justify-between gap-4 pt-1">
						<p class="text-xs text-warm-400 dark:text-warm-500 leading-snug">
							Campos con <span class="text-amber-500">*</span> son requeridos
						</p>
						<button
							type="submit"
							disabled={submitting}
							class="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-7 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
						>
							{#if submitting}
								<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
								</svg>
								Enviando…
							{:else}
								Enviar mensaje
								<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M2 8h12M9 3l5 5-5 5"/>
								</svg>
							{/if}
						</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</section>
