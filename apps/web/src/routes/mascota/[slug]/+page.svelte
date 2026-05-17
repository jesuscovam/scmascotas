<script lang="ts">
	import { Badge, Button, Card } from '@scmascotas/ui';
	let { data } = $props();
	const pet = $derived(data.pet);

	const speciesLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const sizeLabel: Record<string, string> = {
		small: 'Pequeño',
		medium: 'Mediano',
		large: 'Grande'
	};
	const sexLabel: Record<string, string> = {
		male: 'Macho',
		female: 'Hembra',
		unknown: 'Desconocido'
	};

	let activePhoto = $state(0);

	const primaryPhoto = $derived(pet.photos?.[activePhoto]);
	const whatsappUrl = $derived(
		pet.contactWhatsapp
			? `https://wa.me/${pet.contactWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi el reporte de tu mascota en SC Mascotas: ${pet.name ?? 'sin nombre'}`)}`
			: null
	);

	function formatDate(d: string | Date) {
		return new Intl.DateTimeFormat('es-MX', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(d));
	}
</script>

<div class="max-w-4xl mx-auto px-4 py-10">
	<a href="/" class="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 transition-colors"
		>← Volver al listado</a
	>

	<div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Photos -->
		<div class="flex flex-col gap-3">
			<div
				class="bg-warm-100 dark:bg-warm-800 rounded-2xl overflow-hidden aspect-square flex items-center justify-center text-7xl"
			>
				{#if primaryPhoto}
					<img
						src={primaryPhoto.url}
						alt={pet.name ?? 'Mascota'}
						class="w-full h-full object-cover"
					/>
				{:else}
					{pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐾'}
				{/if}
			</div>
			{#if pet.photos && pet.photos.length > 1}
				<div class="flex gap-2 overflow-x-auto pb-1">
					{#each pet.photos as photo, i (photo.id)}
						<button
							onclick={() => (activePhoto = i)}
							class="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors {activePhoto === i
								? 'border-brand-600 dark:border-brand-400'
								: 'border-transparent'}"
						>
							<img src={photo.url} alt="" class="w-full h-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Info -->
		<div class="flex flex-col gap-6">
			<div>
				<div class="flex items-center gap-2 mb-2">
					<Badge.Root variant="amber">
						{speciesLabel[pet.type] ?? pet.type}
					</Badge.Root>
					<Badge.Root variant="green">Buscando</Badge.Root>
				</div>
				<h1 class="font-display text-3xl font-bold text-warm-900 dark:text-warm-50">
					{pet.name ?? 'Sin nombre'}
				</h1>
				{#if pet.colonia}
					<p class="text-warm-500 dark:text-warm-400 mt-1 flex items-center gap-1 text-sm">
						<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
								clip-rule="evenodd"
							/>
						</svg>
						{pet.colonia}
					</p>
				{/if}
			</div>

			<!-- Details grid -->
			<dl class="grid grid-cols-2 gap-3">
				{#if pet.color}
					<div class="bg-warm-50 dark:bg-warm-800 rounded-xl p-3">
						<dt class="text-xs text-warm-500 dark:text-warm-400 font-medium">Color</dt>
						<dd class="text-sm font-semibold text-warm-900 dark:text-warm-50 mt-0.5">{pet.color}</dd>
					</div>
				{/if}
				{#if pet.size}
					<div class="bg-warm-50 dark:bg-warm-800 rounded-xl p-3">
						<dt class="text-xs text-warm-500 dark:text-warm-400 font-medium">Tamaño</dt>
						<dd class="text-sm font-semibold text-warm-900 dark:text-warm-50 mt-0.5">{sizeLabel[pet.size]}</dd>
					</div>
				{/if}
				{#if pet.sex}
					<div class="bg-warm-50 dark:bg-warm-800 rounded-xl p-3">
						<dt class="text-xs text-warm-500 dark:text-warm-400 font-medium">Sexo</dt>
						<dd class="text-sm font-semibold text-warm-900 dark:text-warm-50 mt-0.5">{sexLabel[pet.sex]}</dd>
					</div>
				{/if}
				{#if pet.breed}
					<div class="bg-warm-50 dark:bg-warm-800 rounded-xl p-3">
						<dt class="text-xs text-warm-500 dark:text-warm-400 font-medium">Raza</dt>
						<dd class="text-sm font-semibold text-warm-900 dark:text-warm-50 mt-0.5">{pet.breed}</dd>
					</div>
				{/if}
				<div class="col-span-2 bg-warm-50 dark:bg-warm-800 rounded-xl p-3">
					<dt class="text-xs text-warm-500 dark:text-warm-400 font-medium">Último avistamiento</dt>
					<dd class="text-sm font-semibold text-warm-900 dark:text-warm-50 mt-0.5">{formatDate(pet.lastSeenAt)}</dd>
				</div>
			</dl>

			{#if pet.description}
				<Card.Root class="border-warm-200 dark:border-warm-700">
					<Card.Content class="pt-4">
						<p class="text-xs text-warm-500 dark:text-warm-400 font-medium mb-1">Descripción</p>
						<p class="text-sm text-warm-700 dark:text-warm-300 leading-relaxed">{pet.description}</p>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Contact -->
			{#if !pet.anonymous && whatsappUrl}
				<Button.Root
					href={whatsappUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 px-6 rounded-2xl h-auto w-full"
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
						/>
					</svg>
					Contactar por WhatsApp
				</Button.Root>
			{/if}
		</div>
	</div>

	<!-- Sightings placeholder -->
	<Card.Root class="mt-12 border-warm-200 dark:border-warm-700">
		<Card.Content class="pt-6 pb-6">
			<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-xl mb-2">¿Lo viste? 👀</h2>
			<p class="text-warm-500 dark:text-warm-400 text-sm">
				La función de reportar avistamientos estará disponible próximamente. Por ahora, contacta
				directamente al dueño.
			</p>
		</Card.Content>
	</Card.Root>
</div>
