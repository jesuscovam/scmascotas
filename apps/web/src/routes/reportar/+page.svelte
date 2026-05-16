<script lang="ts">
	import { goto } from '$app/navigation';

	type Colonia = { id: string; name: string };

	let colonias = $state<Colonia[]>([]);
	let coloniaError = $state(false);

	// Form fields
	let name = $state('');
	let species = $state<'dog' | 'cat' | 'other'>('dog');
	let breed = $state('');
	let color = $state('');
	let sex = $state<'male' | 'female' | 'unknown'>('unknown');
	let size = $state<'small' | 'medium' | 'large'>('medium');
	let colonia_id = $state('');
	let last_seen_at = $state('');
	let description = $state('');
	let contact_whatsapp = $state('');
	let contact_name = $state('');
	let anonymous = $state(false);
	let photoFiles = $state<FileList | null>(null);

	let submitting = $state(false);
	let formError = $state('');

	$effect(() => {
		fetch('/api/colonias')
			.then((r) => r.json())
			.then((data: Colonia[]) => {
				colonias = data;
				if (data.length > 0) colonia_id = data[0].id;
			})
			.catch(() => {
				coloniaError = true;
			});
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (submitting) return;
		submitting = true;
		formError = '';

		try {
			const res = await fetch('/api/pets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name || undefined,
					species,
					breed: breed || undefined,
					color,
					sex,
					size,
					colonia_id,
					last_seen_at: new Date(last_seen_at).toISOString(),
					description: description || undefined,
					contact_whatsapp: contact_whatsapp || undefined,
					contact_name: contact_name || undefined,
					anonymous
				})
			});

			if (!res.ok) {
				const err = await res.text();
				formError = err || 'Hubo un error al publicar el reporte.';
				return;
			}

			const { slug, editToken } = await res.json();

			// Upload photos if any
			if (photoFiles && photoFiles.length > 0) {
				// We need the pet ID for uploads — get it from the pet detail
				// For now, use a second call to get the pet and upload photos
				const petRes = await fetch(`/api/pets?slug=${slug}`);
				if (petRes.ok) {
					const { id: petId } = await petRes.json();
					for (let i = 0; i < photoFiles.length; i++) {
						const form = new FormData();
						form.set('petId', petId);
						form.set('file', photoFiles[i]);
						form.set('isPrimary', String(i === 0));
						await fetch('/api/uploads', { method: 'POST', body: form });
					}
				}
			}

			goto(`/exito/${slug}?token=${editToken}`);
		} catch {
			formError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			submitting = false;
		}
	}

	const inputClass =
		'w-full border border-warm-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all';
	const labelClass = 'block text-sm font-semibold text-warm-700 mb-1.5';
</script>

<div class="max-w-2xl mx-auto px-4 py-12">
	<div class="mb-8">
		<a href="/" class="text-sm text-warm-500 hover:text-warm-700 transition-colors">← Volver</a>
		<h1 class="font-display text-3xl font-bold text-warm-900 mt-3">Reportar mascota perdida</h1>
		<p class="text-warm-500 mt-2">Completa el formulario y publicaremos tu reporte de inmediato.</p>
	</div>

	<form onsubmit={handleSubmit} class="flex flex-col gap-6">
		<!-- Basic info -->
		<div class="bg-white rounded-2xl border border-warm-200 shadow-sm p-6 flex flex-col gap-5">
			<h2 class="font-display font-semibold text-warm-900 text-lg">Información básica</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="name" class={labelClass}>Nombre <span class="text-warm-400 font-normal">(opcional)</span></label>
					<input id="name" type="text" bind:value={name} placeholder="Ej. Luna" class={inputClass} />
				</div>

				<div>
					<label for="species" class={labelClass}>Especie</label>
					<select id="species" bind:value={species} class={inputClass}>
						<option value="dog">🐶 Perro</option>
						<option value="cat">🐱 Gato</option>
						<option value="other">🐾 Otro</option>
					</select>
				</div>

				<div>
					<label for="breed" class={labelClass}>Raza <span class="text-warm-400 font-normal">(opcional)</span></label>
					<input id="breed" type="text" bind:value={breed} placeholder="Ej. Mestizo, Labrador" class={inputClass} />
				</div>

				<div>
					<label for="color" class={labelClass}>Color <span class="text-red-500">*</span></label>
					<input id="color" type="text" bind:value={color} placeholder="Ej. Negro con manchas blancas" required class={inputClass} />
				</div>

				<div>
					<label for="sex" class={labelClass}>Sexo</label>
					<select id="sex" bind:value={sex} class={inputClass}>
						<option value="male">Macho</option>
						<option value="female">Hembra</option>
						<option value="unknown">Desconocido</option>
					</select>
				</div>

				<div>
					<label for="size" class={labelClass}>Tamaño</label>
					<select id="size" bind:value={size} class={inputClass}>
						<option value="small">Pequeño</option>
						<option value="medium">Mediano</option>
						<option value="large">Grande</option>
					</select>
				</div>
			</div>

			<div>
				<label for="colonia" class={labelClass}>Colonia donde se perdió <span class="text-red-500">*</span></label>
				{#if coloniaError}
					<p class="text-sm text-red-500">No se pudieron cargar las colonias. Recarga la página.</p>
				{:else if colonias.length === 0}
					<div class="w-full border border-warm-200 rounded-xl px-4 py-2.5 bg-warm-50 text-sm text-warm-400">
						Cargando colonias…
					</div>
				{:else}
					<select id="colonia" bind:value={colonia_id} required class={inputClass}>
						{#each colonias as c (c.id)}
							<option value={c.id}>{c.name}</option>
						{/each}
					</select>
				{/if}
			</div>

			<div>
				<label for="last_seen_at" class={labelClass}>Fecha de último avistamiento <span class="text-red-500">*</span></label>
				<input
					id="last_seen_at"
					type="date"
					bind:value={last_seen_at}
					required
					max={new Date().toISOString().split('T')[0]}
					class={inputClass}
				/>
			</div>

			<div>
				<label for="description" class={labelClass}>Descripción <span class="text-warm-400 font-normal">(opcional)</span></label>
				<textarea
					id="description"
					bind:value={description}
					placeholder="Detalles adicionales que ayuden a identificarlo..."
					rows="3"
					class="{inputClass} resize-none"
				></textarea>
			</div>
		</div>

		<!-- Photos -->
		<div class="bg-white rounded-2xl border border-warm-200 shadow-sm p-6 flex flex-col gap-4">
			<h2 class="font-display font-semibold text-warm-900 text-lg">Fotos <span class="text-warm-400 font-normal text-base">(opcional)</span></h2>
			<label
				class="border-2 border-dashed border-warm-200 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-all text-center"
			>
				<span class="text-3xl">📷</span>
				<span class="text-sm font-medium text-warm-700">Haz clic para subir fotos</span>
				<span class="text-xs text-warm-400">JPG, PNG · Máx. 5 MB cada una</span>
				<input type="file" accept="image/*" multiple bind:files={photoFiles} class="hidden" />
			</label>
			{#if photoFiles && photoFiles.length > 0}
				<p class="text-sm text-warm-500">{photoFiles.length} foto(s) seleccionada(s)</p>
			{/if}
		</div>

		<!-- Contact -->
		<div class="bg-white rounded-2xl border border-warm-200 shadow-sm p-6 flex flex-col gap-5">
			<h2 class="font-display font-semibold text-warm-900 text-lg">Contacto</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="whatsapp" class={labelClass}>WhatsApp <span class="text-warm-400 font-normal">(opcional)</span></label>
					<input
						id="whatsapp"
						type="tel"
						bind:value={contact_whatsapp}
						placeholder="+52 967 000 0000"
						class={inputClass}
					/>
				</div>
				<div>
					<label for="contact_name" class={labelClass}>Tu nombre <span class="text-warm-400 font-normal">(opcional)</span></label>
					<input id="contact_name" type="text" bind:value={contact_name} placeholder="Ej. María" class={inputClass} />
				</div>
			</div>

			<label class="flex items-start gap-3 cursor-pointer">
				<input type="checkbox" bind:checked={anonymous} class="mt-0.5 w-4 h-4 accent-brand-800" />
				<div>
					<span class="text-sm font-medium text-warm-700">Publicar de forma anónima</span>
					<p class="text-xs text-warm-400 mt-0.5">No se mostrará la información de contacto en el reporte público.</p>
				</div>
			</label>
		</div>

		{#if formError}
			<div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
				{formError}
			</div>
		{/if}

		<button
			type="submit"
			disabled={submitting || !color || !last_seen_at || !colonia_id}
			class="bg-brand-800 hover:bg-brand-900 disabled:bg-warm-200 disabled:text-warm-400 disabled:cursor-not-allowed text-white font-bold text-base px-8 py-4 rounded-2xl transition-all"
		>
			{submitting ? 'Publicando...' : 'Publicar reporte →'}
		</button>
	</form>
</div>
