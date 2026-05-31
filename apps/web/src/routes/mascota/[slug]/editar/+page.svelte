<script lang="ts">
	import { PetNotifyLevelSelect } from '@scmascotas/ui';
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

	const urlToken = typeof window !== 'undefined'
		? new URLSearchParams(window.location.search).get('token') ?? ''
		: '';

	let editToken = $state(urlToken || (pet.editToken ?? ''));
	let name = $state(pet.name ?? '');
	let description = $state(pet.description ?? '');
	let color = $state(pet.color ?? '');
	let sex = $state(pet.sex ?? 'unknown');
	let size = $state(pet.size ?? '');
	let breed = $state(pet.breed ?? '');
	let lastSeenAt = $state(
		pet.lastSeenAt ? new Date(pet.lastSeenAt).toISOString().split('T')[0] : ''
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
				saveError = res.status === 403 ? 'Código de edición incorrecto.' : msg || 'Error al guardar. Intenta de nuevo.';
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
				reuniteError = res.status === 403 ? 'Código de edición incorrecto.' : msg || 'Error al actualizar. Intenta de nuevo.';
				return;
			}

			window.location.href = `/reunido/${pet.slug}`;
		} catch {
			reuniteError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			reuniting = false;
		}
	}

	const typeLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };

	const inputClass = 'w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-white dark:bg-warm-700/60 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-transparent transition-all';
	const labelClass = 'block text-xs font-bold text-warm-500 dark:text-warm-400 uppercase tracking-wider mb-1.5';
</script>

<svelte:head>
	<title>Editar · {pet.name ?? 'Mascota'} · SC Mascotas</title>
</svelte:head>

<div class="min-h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900 pb-24">

	<!-- Page header -->
	<div class="relative overflow-hidden border-b border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800">
		<div class="absolute inset-0 pointer-events-none">
			<div class="absolute -top-8 -right-8 w-56 h-40 rounded-full bg-amber-100/60 dark:bg-amber-900/15 blur-3xl"></div>
		</div>
		<div class="relative max-w-2xl mx-auto px-4 py-6">
			<a
				href="/mascota/{pet.slug}"
				class="inline-flex items-center gap-1.5 text-sm text-warm-400 dark:text-warm-500 hover:text-warm-700 dark:hover:text-warm-200 transition-colors mb-4 group"
			>
				<svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
				</svg>
				Volver al reporte
			</a>

			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-2xl shrink-0 select-none">
					{typeEmoji[pet.type] ?? '🐾'}
				</div>
				<div>
					<h1 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
						{pet.name ?? 'Sin nombre'}
					</h1>
					<p class="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
						{typeLabel[pet.type] ?? 'Mascota'} · Editando reporte
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

		<!-- Success banner -->
		{#if saveSuccess}
			<div class="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4 success-banner">
				<svg class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
				<p class="text-sm font-semibold text-green-700 dark:text-green-300">¡Cambios guardados correctamente!</p>
			</div>
		{/if}

		<!-- Edit token (non-owners only) -->
		{#if !isOwner}
			<div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 flex flex-col gap-3">
				<div class="flex items-center gap-2.5">
					<span class="text-lg">🔑</span>
					<div>
						<p class="font-semibold text-warm-900 dark:text-warm-50 text-sm">Código de edición</p>
						<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">Ingresa el código que recibiste al publicar el reporte.</p>
					</div>
				</div>
				<input
					bind:value={editToken}
					type="text"
					placeholder="Pega tu código aquí"
					class="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-warm-800 text-warm-900 dark:text-warm-50 placeholder-warm-400 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-transparent transition-all"
				/>
			</div>
		{/if}

		<!-- Main edit form -->
		<form onsubmit={save} class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm overflow-hidden">

			<!-- Section: Identificación -->
			<div class="px-6 pt-6 pb-2">
				<p class="text-[11px] font-bold text-warm-400 dark:text-warm-500 uppercase tracking-widest mb-4">Identificación</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="edit-name" class={labelClass}>Nombre</label>
						<input id="edit-name" bind:value={name} type="text" placeholder="Ej. Luna" class={inputClass} />
					</div>
					<div>
						<label for="edit-breed" class={labelClass}>Raza</label>
						<input id="edit-breed" bind:value={breed} type="text" placeholder="Ej. Labrador, Mestizo" class={inputClass} />
					</div>
					<div>
						<label for="edit-color" class={labelClass}>Color</label>
						<input id="edit-color" bind:value={color} type="text" placeholder="Ej. Café con blanco" class={inputClass} />
					</div>
					<div>
						<label for="edit-sex" class={labelClass}>Sexo</label>
						<select id="edit-sex" bind:value={sex} class={inputClass}>
							<option value="unknown">Desconocido</option>
							<option value="male">Macho</option>
							<option value="female">Hembra</option>
						</select>
					</div>
					<div>
						<label for="edit-size" class={labelClass}>Tamaño</label>
						<select id="edit-size" bind:value={size} class={inputClass}>
							<option value="">No especificado</option>
							<option value="small">Pequeño</option>
							<option value="medium">Mediano</option>
							<option value="large">Grande</option>
						</select>
					</div>
					<div>
						<label for="edit-date" class={labelClass}>Última vez visto</label>
						<input id="edit-date" bind:value={lastSeenAt} type="date" class={inputClass} />
					</div>
				</div>
			</div>

			<div class="mx-6 my-5 h-px bg-warm-100 dark:bg-warm-700"></div>

			<!-- Section: Descripción -->
			<div class="px-6 pb-2">
				<p class="text-[11px] font-bold text-warm-400 dark:text-warm-500 uppercase tracking-widest mb-4">Descripción</p>
				<textarea
					id="edit-desc"
					bind:value={description}
					maxlength="1000"
					placeholder="Describe a tu mascota, señas particulares, último lugar donde fue vista..."
					rows="4"
					class="{inputClass} resize-none leading-relaxed"
				></textarea>
				<p class="text-xs text-warm-400 dark:text-warm-500 mt-1.5 text-right tabular-nums">{description.length}/1000</p>
			</div>

			<div class="mx-6 my-5 h-px bg-warm-100 dark:bg-warm-700"></div>

			<!-- Section: Contacto -->
			<div class="px-6 pb-2">
				<p class="text-[11px] font-bold text-warm-400 dark:text-warm-500 uppercase tracking-widest mb-4">Contacto</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="edit-wa" class={labelClass}>WhatsApp</label>
						<input id="edit-wa" bind:value={contactWhatsapp} type="tel" placeholder="+529671234567" class={inputClass} />
					</div>
					<div>
						<label for="edit-contact-name" class={labelClass}>Tu nombre</label>
						<input id="edit-contact-name" bind:value={contactName} type="text" placeholder="Nombre de contacto" class={inputClass} />
					</div>
				</div>
			</div>

			<!-- Error + save button -->
			<div class="px-6 py-6 mt-2">
				{#if saveError}
					<div class="mb-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
						<svg class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
						{saveError}
					</div>
				{/if}
				<button
					type="submit"
					disabled={saving}
					class="w-full flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-sm text-sm"
				>
					{#if saving}
						<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
						Guardando…
					{:else}
						Guardar cambios
					{/if}
				</button>
			</div>
		</form>

		<!-- Notifications (owner only) -->
		{#if isOwner}
			<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm overflow-hidden">
				<div class="px-6 pt-6 pb-5">
					<div class="flex items-center gap-2.5 mb-4">
						<span class="text-lg">🔔</span>
						<div>
							<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-base">Notificaciones</h2>
							<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">¿Cuándo quieres que te avisemos sobre esta mascota?</p>
						</div>
					</div>
					<PetNotifyLevelSelect value={notifyLevel} saving={savingNotify} onChange={changeNotifyLevel} />
					<p class="text-xs text-warm-400 dark:text-warm-500 mt-3 leading-relaxed">
						Recibirás los avisos por correo y dentro de la app. Ajusta tus canales en
						<a href="/cuenta/notificaciones" class="underline hover:text-amber-600 dark:hover:text-amber-400 transition-colors">tus preferencias</a>.
					</p>
				</div>
			</div>
		{/if}

		<!-- Reunite -->
		<div class="rounded-3xl overflow-hidden shadow-sm reunite-card">
			<div class="relative px-6 py-5 bg-gradient-to-br from-green-50 via-emerald-50/60 to-teal-50/30 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-transparent border border-green-200 dark:border-green-800 rounded-3xl">
				<div class="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
					<div class="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-green-200/30 dark:bg-green-700/10 blur-2xl"></div>
				</div>
				<div class="relative">
					<div class="flex items-center gap-2.5 mb-3">
						<div class="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-700 flex items-center justify-center text-xl shrink-0">
							🎉
						</div>
						<div>
							<h2 class="font-display font-semibold text-green-900 dark:text-green-200 text-base">¿La encontraste?</h2>
							<p class="text-xs text-green-700/70 dark:text-green-400/70 mt-0.5">Marca el reporte como reunido</p>
						</div>
					</div>
					<p class="text-sm text-green-800/80 dark:text-green-300/80 leading-relaxed mb-4">
						Celébralo con la comunidad y retira el reporte activo. ¡Es una buena noticia para todos! 🐾
					</p>

					{#if reuniteError}
						<div class="mb-3 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
							<svg class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
							{reuniteError}
						</div>
					{/if}

					<button
						onclick={reunite}
						disabled={reuniting}
						class="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-sm shadow-green-500/20 text-sm"
					>
						{#if reuniting}
							<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
							Procesando…
						{:else}
							¡La encontré! Marcar como reunida
						{/if}
					</button>
				</div>
			</div>
		</div>

	</div>
</div>

<style>
	@keyframes success-in {
		from { opacity: 0; transform: translateY(-6px); }
		to   { opacity: 1; transform: translateY(0); }
	}
	.success-banner {
		animation: success-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
</style>
