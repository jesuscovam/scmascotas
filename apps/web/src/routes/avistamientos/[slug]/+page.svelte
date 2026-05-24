<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const s = $derived(data.sighting);

	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };
	const typeLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };
	const statusLabel: Record<string, string> = { open: 'Abierto', resolved: 'Resuelto ✓' };

	const whatsappUrl = $derived(
		s.contactWhatsapp
			? `https://wa.me/${s.contactWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, vi tu avistamiento en SC Mascotas y me gustaría darte más información.')}`
			: null
	);

	function formatDate(d: string | Date): string {
		return new Intl.DateTimeFormat('es-MX', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(d));
	}

	function timeAgo(date: string | Date): string {
		const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem.`;
		return `Hace ${Math.floor(diff / 30)} meses`;
	}
</script>

<svelte:head>
	<title>Avistamiento — {typeLabel[s.type] ?? s.type} en {s.colonia ?? 'San Cristóbal'} — SC Mascotas</title>
	<meta name="description" content="Avistamiento de {typeLabel[s.type] ?? 'mascota'} reportado en {s.colonia ?? 'San Cristóbal de las Casas'}." />
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
	.reveal {
		animation: fade-up 0.4s ease both;
	}
	.reveal-photo {
		animation: scale-in 0.5s ease both;
	}
</style>

<div class="min-h-screen bg-[#f4faf9] dark:bg-warm-900"
	style="background-image: radial-gradient(circle, rgba(20,184,166,0.06) 1px, transparent 1px); background-size: 22px 22px;">

	<div class="max-w-3xl mx-auto px-4 py-10 pb-20">

		<!-- Back nav -->
		<a
			href="/avistamientos"
			class="reveal inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium group mb-8"
			style="animation-delay: 0ms"
		>
			<svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
			</svg>
			Volver a avistamientos
		</a>

		<!-- Hero photo -->
		<div class="reveal-photo rounded-3xl overflow-hidden mb-6 shadow-lg shadow-teal-900/10 dark:shadow-teal-900/30 relative" style="animation-delay: 60ms">
			{#if s.photoUrl}
				<div class="aspect-[16/9] sm:aspect-[2/1]">
					<img
						src={s.photoUrl}
						alt="Foto del avistamiento"
						class="w-full h-full object-cover"
					/>
					<!-- Gradient overlay at bottom -->
					<div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
					<!-- Status badge top-right -->
					<span class="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full
						{s.status === 'resolved'
							? 'bg-emerald-500 text-white'
							: 'bg-teal-500 text-white'}">
						{statusLabel[s.status] ?? s.status}
					</span>
				</div>
			{:else}
				<!-- Placeholder with dot texture + large emoji -->
				<div class="aspect-[16/9] sm:aspect-[2/1] bg-gradient-to-br from-teal-50 via-teal-100/50 to-warm-100 dark:from-teal-900/40 dark:via-teal-900/20 dark:to-warm-800 flex items-center justify-center relative">
					<div class="absolute inset-0 opacity-25" style="background-image: radial-gradient(circle, #0d9488 1px, transparent 1px); background-size: 18px 18px;"></div>
					<span class="text-8xl drop-shadow-md relative z-10">{typeEmoji[s.type] ?? '🐾'}</span>
					<!-- Status badge -->
					<span class="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full
						{s.status === 'resolved'
							? 'bg-emerald-500 text-white'
							: 'bg-teal-500 text-white'}">
						{statusLabel[s.status] ?? s.status}
					</span>
				</div>
			{/if}
		</div>

		<!-- Main card -->
		<div class="reveal bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 border-l-4 border-l-teal-400 shadow-sm overflow-hidden mb-4" style="animation-delay: 120ms">

			<!-- Header row -->
			<div class="px-5 pt-5 pb-4 border-b border-warm-100 dark:border-warm-700">
				<div class="flex items-start gap-3">
					<span class="text-3xl mt-0.5">{typeEmoji[s.type] ?? '🐾'}</span>
					<div class="flex-1 min-w-0">
						<div class="flex flex-wrap items-center gap-2 mb-1">
							<span class="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700 px-2.5 py-0.5 rounded-full">
								{typeLabel[s.type] ?? s.type}
							</span>
							{#if s.color}
								<span class="text-xs text-warm-600 dark:text-warm-300 bg-warm-100 dark:bg-warm-700 px-2 py-0.5 rounded-full">
									{s.color}
								</span>
							{/if}
							{#if s.size}
								<span class="text-xs text-warm-600 dark:text-warm-300 bg-warm-100 dark:bg-warm-700 px-2 py-0.5 rounded-full">
									{sizeLabel[s.size]}
								</span>
							{/if}
						</div>
						<h1 class="font-display text-xl font-bold text-warm-900 dark:text-warm-50 leading-snug">
							{typeLabel[s.type] ?? 'Mascota'} avistada en {s.colonia ?? 'San Cristóbal'}
						</h1>
					</div>
				</div>
			</div>

			<!-- Details grid -->
			<div class="px-5 py-4 grid grid-cols-2 gap-3">
				<div class="bg-warm-50 dark:bg-warm-700/50 rounded-xl p-3">
					<p class="text-[10px] uppercase tracking-wider font-bold text-warm-400 dark:text-warm-500 mb-0.5">Colonia</p>
					<p class="text-sm font-semibold text-warm-800 dark:text-warm-100 flex items-center gap-1">
						<span class="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"></span>
						{s.colonia ?? 'No especificada'}
					</p>
				</div>
				<div class="bg-warm-50 dark:bg-warm-700/50 rounded-xl p-3">
					<p class="text-[10px] uppercase tracking-wider font-bold text-warm-400 dark:text-warm-500 mb-0.5">Reportado</p>
					<p class="text-sm font-semibold text-warm-800 dark:text-warm-100">{timeAgo(s.createdAt)}</p>
					<p class="text-[10px] text-warm-400 dark:text-warm-500 mt-0.5 capitalize">{formatDate(s.createdAt)}</p>
				</div>
			</div>

			<!-- Description -->
			{#if s.description}
				<div class="px-5 pb-5">
					<div class="bg-teal-50/60 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 rounded-2xl p-4">
						<p class="text-[10px] uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400 mb-2">Descripción del avistamiento</p>
						<p class="text-sm text-warm-700 dark:text-warm-300 leading-relaxed">{s.description}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Matched pet card — shown if this sighting is linked to a reported missing pet -->
		{#if s.matchedPetName && s.matchedPetSlug}
			<div class="reveal mb-4" style="animation-delay: 180ms">
				<a
					href="/mascota/{s.matchedPetSlug}"
					class="flex items-center gap-4 bg-white dark:bg-warm-800 rounded-2xl border border-amber-200 dark:border-amber-700 border-l-4 border-l-amber-400 px-4 py-4 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600 transition-all group"
				>
					<span class="text-3xl shrink-0">
						{s.matchedPetType === 'dog' ? '🐶' : s.matchedPetType === 'cat' ? '🐱' : '🐾'}
					</span>
					<div class="flex-1 min-w-0">
						<p class="text-[10px] uppercase tracking-wider font-bold text-amber-500 dark:text-amber-400 mb-0.5">
							Posible mascota reportada perdida
						</p>
						<p class="text-sm font-bold text-warm-900 dark:text-warm-50 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
							{s.matchedPetName}
						</p>
						<p class="text-xs text-warm-500 dark:text-warm-400">Ver reporte completo →</p>
					</div>
					<svg class="w-4 h-4 text-warm-400 dark:text-warm-500 shrink-0 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
					</svg>
				</a>
			</div>
		{/if}

		<!-- Contact CTA -->
		{#if whatsappUrl}
			<div class="reveal mb-4" style="animation-delay: 200ms">
				<a
					href={whatsappUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-sm shadow-green-200 dark:shadow-green-900/30"
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
					</svg>
					Contactar al reportante por WhatsApp
				</a>
			</div>
		{/if}

		<!-- Report your own button -->
		<div class="reveal mt-8 border-t border-warm-200 dark:border-warm-700 pt-8 text-center" style="animation-delay: 240ms">
			<p class="text-sm text-warm-500 dark:text-warm-400 mb-3">
				¿Reconociste esta mascota? Ayuda a reunirla con su familia.
			</p>
			<div class="flex flex-wrap justify-center gap-3">
				<a
					href="/mascotas"
					class="inline-flex items-center gap-2 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold text-sm px-5 py-2.5 rounded-2xl transition-colors"
				>
					🐾 Ver mascotas perdidas
				</a>
				<a
					href="/reportar/vi"
					class="inline-flex items-center gap-2 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold text-sm px-5 py-2.5 rounded-2xl transition-colors"
				>
					👀 Reportar otro avistamiento
				</a>
			</div>
		</div>

	</div>
</div>
