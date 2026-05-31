<script lang="ts">
	import { Card, PetNotifyLevelSelect } from '@scmascotas/ui';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	const pet = $derived(data.pet);
	const user = $derived(data.user ?? null);

	const isOwner = $derived(!!user?.id && user.id === pet.reporterUserId);

	let notifyLevel = $state<'off' | 'matches' | 'colonia'>(
		(pet.notifyLevel as 'off' | 'matches' | 'colonia') ?? 'matches'
	);
	let savingNotify = $state(false);

	async function changeNotifyLevel(level: 'off' | 'matches' | 'colonia') {
		const previous = notifyLevel;
		notifyLevel = level;
		savingNotify = true;
		try {
			const res = await fetch(`/api/pets/${pet.id}/notify-level`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ level })
			});
			if (!res.ok) notifyLevel = previous;
			else await invalidateAll();
		} catch {
			notifyLevel = previous;
		} finally {
			savingNotify = false;
		}
	}

	// Pre-fill edit token from URL if present
	const urlToken = typeof window !== 'undefined'
		? new URLSearchParams(window.location.search).get('token') ?? ''
		: '';

	let editToken = $state(urlToken || (pet.editToken ?? ''));

	// Edit form state
	let name = $state(pet.name ?? '');
	let description = $state(pet.description ?? '');
	let color = $state(pet.color ?? '');
	let sex = $state(pet.sex ?? 'unknown');
	let size = $state(pet.size ?? '');
	let breed = $state(pet.breed ?? '');
	let lastSeenAt = $state(
		pet.lastSeenAt
			? new Date(pet.lastSeenAt).toISOString().split('T')[0]
			: ''
	);
	let contactWhatsapp = $state(pet.contactWhatsapp ?? '');
	let contactName = $state(pet.contactName ?? '');

	let saving = $state(false);
	let saveError = $state('');
	let saveSuccess = $state(false);

	let reuniting = $state(false);
	let reuniteError = $state('');

	async function save(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		saveError = '';
		saveSuccess = false;

		const payload: Record<string, unknown> = { editToken: editToken || undefined };
		if (name) payload.name = name;
		if (description) payload.description = description;
		if (color) payload.color = color;
		if (sex) payload.sex = sex;
		if (size) payload.size = size;
		if (breed) payload.breed = breed;
		if (lastSeenAt) payload.last_seen_at = new Date(lastSeenAt);
		if (contactWhatsapp) payload.contact_whatsapp = contactWhatsapp;
		if (contactName) payload.contact_name = contactName;

		try {
			const res = await fetch(`/api/pets/${pet.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const msg = await res.text().catch(() => '');
				if (res.status === 403) saveError = 'Código de edición incorrecto.';
				else saveError = msg || 'Error al guardar. Intenta de nuevo.';
				return;
			}

			saveSuccess = true;
			setTimeout(() => (saveSuccess = false), 4000);
		} catch {
			saveError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			saving = false;
		}
	}

	async function reunite() {
		reuniting = true;
		reuniteError = '';

		try {
			const res = await fetch(`/api/pets/${pet.id}/reunited`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ editToken: editToken || undefined })
			});

			if (!res.ok) {
				const msg = await res.text().catch(() => '');
				if (res.status === 403) reuniteError = 'Código de edición incorrecto.';
				else reuniteError = msg || 'Error al actualizar. Intenta de nuevo.';
				return;
			}

			window.location.href = `/reunido/${pet.slug}`;
		} catch {
			reuniteError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			reuniting = false;
		}
	}

	const inputClass = 'w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-transparent transition-all';
	const labelClass = 'text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider';
</script>

<div class="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
	<!-- Header -->
	<div>
		<a
			href="/mascota/{pet.slug}"
			class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 transition-colors mb-4"
		>
			<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
			</svg>
			Volver al reporte
		</a>
		<h1 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50">
			Editar reporte
		</h1>
		<p class="text-warm-500 dark:text-warm-400 text-sm mt-1">
			{pet.name ?? 'Mascota sin nombre'} · {pet.type === 'dog' ? 'Perro' : pet.type === 'cat' ? 'Gato' : 'Otro'}
		</p>
	</div>

	<!-- Success banner -->
	{#if saveSuccess}
		<div class="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4">
			<svg class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="20 6 9 17 4 12" />
			</svg>
			<p class="text-sm font-semibold text-green-700 dark:text-green-300">¡Cambios guardados correctamente!</p>
		</div>
	{/if}

	<!-- Edit token card (always show if not confirmed owner) -->
	{#if !isOwner}
		<Card.Root class="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
			<Card.Content class="pt-5 pb-5 flex flex-col gap-3">
				<div class="flex items-start gap-2">
					<span class="text-xl shrink-0">🔑</span>
					<div>
						<p class="font-semibold text-warm-900 dark:text-warm-50 text-sm">Código de edición</p>
						<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
							Ingresa el código que recibiste al publicar el reporte.
						</p>
					</div>
				</div>
				<input
					bind:value={editToken}
					type="text"
					placeholder="Pega tu código de edición aquí"
					class="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-warm-800 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-transparent transition-all"
				/>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Edit form -->
	<form onsubmit={save} class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl overflow-hidden shadow-sm">
		<div class="px-6 py-4 border-b border-warm-100 dark:border-warm-700">
			<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-base">Datos del reporte</h2>
		</div>

		<div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
			<!-- Name -->
			<div class="flex flex-col gap-1.5">
				<label for="edit-name" class={labelClass}>Nombre</label>
				<input id="edit-name" bind:value={name} type="text" placeholder="Ej. Luna" class={inputClass} />
			</div>

			<!-- Breed -->
			<div class="flex flex-col gap-1.5">
				<label for="edit-breed" class={labelClass}>Raza</label>
				<input id="edit-breed" bind:value={breed} type="text" placeholder="Ej. Labrador, Mestizo" class={inputClass} />
			</div>

			<!-- Color -->
			<div class="flex flex-col gap-1.5">
				<label for="edit-color" class={labelClass}>Color</label>
				<input id="edit-color" bind:value={color} type="text" placeholder="Ej. Café con blanco" class={inputClass} />
			</div>

			<!-- Sex -->
			<div class="flex flex-col gap-1.5">
				<label for="edit-sex" class={labelClass}>Sexo</label>
				<select id="edit-sex" bind:value={sex} class={inputClass}>
					<option value="unknown">Desconocido</option>
					<option value="male">Macho</option>
					<option value="female">Hembra</option>
				</select>
			</div>

			<!-- Size -->
			<div class="flex flex-col gap-1.5">
				<label for="edit-size" class={labelClass}>Tamaño</label>
				<select id="edit-size" bind:value={size} class={inputClass}>
					<option value="">No especificado</option>
					<option value="small">Pequeño</option>
					<option value="medium">Mediano</option>
					<option value="large">Grande</option>
				</select>
			</div>

			<!-- Last seen date -->
			<div class="flex flex-col gap-1.5">
				<label for="edit-date" class={labelClass}>Última vez visto</label>
				<input id="edit-date" bind:value={lastSeenAt} type="date" class={inputClass} />
			</div>

			<!-- Contact WhatsApp -->
			<div class="flex flex-col gap-1.5">
				<label for="edit-wa" class={labelClass}>WhatsApp</label>
				<input id="edit-wa" bind:value={contactWhatsapp} type="tel" placeholder="+529671234567" class={inputClass} />
			</div>

			<!-- Contact name -->
			<div class="flex flex-col gap-1.5">
				<label for="edit-contact-name" class={labelClass}>Nombre de contacto</label>
				<input id="edit-contact-name" bind:value={contactName} type="text" placeholder="Tu nombre" class={inputClass} />
			</div>

			<!-- Description (full width) -->
			<div class="col-span-full flex flex-col gap-1.5">
				<label for="edit-desc" class={labelClass}>Descripción</label>
				<textarea
					id="edit-desc"
					bind:value={description}
					maxlength="1000"
					placeholder="Describe a tu mascota, señas particulares, último lugar donde fue vista..."
					rows="4"
					class="{inputClass} resize-none leading-relaxed"
				></textarea>
			</div>
		</div>

		{#if saveError}
			<div class="mx-6 mb-4">
				<p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
					{saveError}
				</p>
			</div>
		{/if}

		<div class="px-6 pb-6">
			<button
				type="submit"
				disabled={saving}
				class="w-full flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-sm text-sm"
			>
				{#if saving}
					<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					Guardando…
				{:else}
					Guardar cambios
				{/if}
			</button>
		</div>
	</form>

	<!-- Reunite section -->
	<div class="bg-white dark:bg-warm-800 border border-green-200 dark:border-green-800 rounded-2xl overflow-hidden shadow-sm">
		<div class="px-6 py-4 border-b border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
			<h2 class="font-display font-semibold text-green-900 dark:text-green-200 text-base flex items-center gap-2">
				<span>🐾</span> Marcar como reunido
			</h2>
		</div>
		<div class="p-6 flex flex-col gap-4">
			<p class="text-sm text-warm-600 dark:text-warm-400 leading-relaxed">
				¿Encontraste a tu mascota? Márcala como reunida para celebrarlo con la comunidad y retirar el reporte activo.
			</p>

			{#if reuniteError}
				<p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
					{reuniteError}
				</p>
			{/if}

			<button
				onclick={reunite}
				disabled={reuniting}
				class="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-sm text-sm"
			>
				{#if reuniting}
					<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					Procesando…
				{:else}
					🎉 ¡La encontré! Marcar como reunida
				{/if}
			</button>
		</div>
	</div>

	{#if isOwner}
		<!-- Notification preferences for this pet -->
		<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl overflow-hidden shadow-sm">
			<div class="px-6 py-4 border-b border-warm-100 dark:border-warm-700 flex items-center gap-2">
				<span>🔔</span>
				<div>
					<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-base">Notificaciones</h2>
					<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
						¿Cuándo quieres que te avisemos sobre esta mascota?
					</p>
				</div>
			</div>
			<div class="p-6">
				<PetNotifyLevelSelect value={notifyLevel} saving={savingNotify} onChange={changeNotifyLevel} />
				<p class="text-xs text-warm-400 dark:text-warm-500 mt-3 leading-relaxed">
					Recibirás los avisos por correo y dentro de la app. Ajusta tus canales en
					<a href="/cuenta/notificaciones" class="underline hover:text-amber-600 dark:hover:text-amber-400">tus preferencias</a>.
				</p>
			</div>
		</div>
	{/if}
</div>
