<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Select, Calendar, Popover, Button, Spinner, SpeciesPicker } from '@scmascotas/ui';
	import AlphaBanner from '$lib/components/AlphaBanner.svelte';
	import PhotoPicker from '$lib/components/PhotoPicker.svelte';
	import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';
	import type { CalendarDate as CalendarDateType } from '@internationalized/date';

	type Colonia = { id: string; name: string };

	type FormSnapshot = {
		name: string;
		species: 'dog' | 'cat' | 'other' | '';
		breed: string;
		color: string;
		sex: 'male' | 'female' | 'unknown';
		size: 'small' | 'medium' | 'large';
		colonia_id: string;
		last_seen_at: string;
		description: string;
		contact_whatsapp: string;
		contact_name: string;
		anonymous: boolean;
	};

	let colonias = $state<Colonia[]>([]);
	let coloniaError = $state(false);

	let name = $state('');
	let species = $state<'dog' | 'cat' | 'other' | ''>('');
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
	let photoFiles = $state<File[]>([]);
	let submitting = $state(false);
	let formError = $state('');
	let rateLimited = $state(false);

	let calendarValue = $state<CalendarDateType | undefined>(undefined);
	let calendarOpen = $state(false);

	// Sync calendar selection → last_seen_at
	$effect(() => {
		const val = calendarValue;
		if (val) last_seen_at = val.toString();
	});

	function formatDisplayDate(v: CalendarDateType): string {
		return v.toDate(getLocalTimeZone()).toLocaleDateString('es-MX', {
			day: 'numeric', month: 'long', year: 'numeric'
		});
	}

	let currentStep = $state(0);
	let animDir = $state(1);

	const STEPS = ['Especie', 'Detalles', 'Ubicación', 'Contacto'];

	// Sync URL ?step param → currentStep + animDir.
	// untrack(currentStep) avoids a dependency cycle while still reading the previous value for direction.
	$effect(() => {
		const stepParam = page.url.searchParams.get('step');
		if (stepParam === null) {
			goto('?step=0', { replaceState: true, noScroll: true });
			return;
		}
		const next = Number(stepParam);
		const prev = untrack(() => currentStep);
		if (next !== prev) {
			animDir = next > prev ? 1 : -1;
			currentStep = next;
		}
	});

	$effect(() => {
		fetch('/api/colonias')
			.then((r) => r.json())
			.then((data: Colonia[]) => {
				colonias = data;
				// Don't overwrite a colonia_id that was already set (e.g. restored from snapshot)
				if (data.length > 0 && !untrack(() => colonia_id)) colonia_id = data[0].id;
			})
			.catch(() => {
				coloniaError = true;
			});
	});

	export const snapshot = {
		capture: (): FormSnapshot => ({
			name, species, breed, color, sex, size,
			colonia_id, last_seen_at, description,
			contact_whatsapp, contact_name, anonymous
		}),
		restore: (data: FormSnapshot) => {
			({ name, species, breed, color, sex, size, colonia_id,
			   last_seen_at, description, contact_whatsapp, contact_name, anonymous } = data);
			if (data.last_seen_at) {
				const [y, m, d] = data.last_seen_at.split('-').map(Number);
				calendarValue = new CalendarDate(y, m, d);
			}
		}
	};

	function goNext() {
		goto(`?step=${currentStep + 1}`, { replaceState: false, noScroll: true });
	}

	function goBack() {
		history.back();
	}

	function selectSpecies(s: 'dog' | 'cat' | 'other') {
		species = s;
		setTimeout(() => goto('?step=1', { replaceState: false, noScroll: true }), 380);
	}

	const canContinue = $derived(
		currentStep === 1 ? color.trim() !== '' :
		currentStep === 2 ? colonia_id !== '' && last_seen_at !== '' :
		true
	);

	async function handleSubmit() {
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
				if (res.status === 429) {
					rateLimited = true;
					return;
				}
				const err = await res.text();
				formError = err || 'Hubo un error al publicar el reporte.';
				return;
			}

			const { slug, editToken } = await res.json();

			if (photoFiles.length > 0) {
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
		'w-full border border-warm-200 dark:border-warm-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-warm-800 text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-600 focus:border-brand-400 dark:focus:border-brand-600 transition-all placeholder:text-warm-400 dark:placeholder:text-warm-500';
	const labelClass = 'block text-sm font-semibold text-warm-700 dark:text-warm-200 mb-1.5';
</script>

<div
	class="min-h-screen bg-[#faf9f7] dark:bg-warm-900 bg-dots-amber"
>
	<div class="max-w-2xl mx-auto px-4 py-10 pb-24">

		<!-- Back link -->
		<a href="/" class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 transition-colors font-medium">
			<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
			</svg>
			Volver al inicio
		</a>

		{#if rateLimited}
			<!-- Rate limit error state -->
			<div class="mt-12 flex flex-col items-center text-center gap-6">
				<!-- Illustration -->
				<div class="relative">
					<div class="w-24 h-24 rounded-full flex items-center justify-center"
						style="background: radial-gradient(circle at 35% 35%, #fde68a, #d97706);">
						<svg viewBox="0 0 96 96" class="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
							<ellipse cx="48" cy="68" rx="22" ry="18" fill="#92400e"/>
							<ellipse cx="48" cy="68" rx="18" ry="14" fill="#b45309"/>
							<ellipse cx="17" cy="47" rx="11" ry="9.5" fill="#92400e"/>
							<ellipse cx="17" cy="47" rx="8.5" ry="7.5" fill="#b45309"/>
							<ellipse cx="36" cy="36" rx="11" ry="9.5" fill="#92400e"/>
							<ellipse cx="36" cy="36" rx="8.5" ry="7.5" fill="#b45309"/>
							<ellipse cx="60" cy="36" rx="11" ry="9.5" fill="#92400e"/>
							<ellipse cx="60" cy="36" rx="8.5" ry="7.5" fill="#b45309"/>
							<ellipse cx="79" cy="47" rx="11" ry="9.5" fill="#92400e"/>
							<ellipse cx="79" cy="47" rx="8.5" ry="7.5" fill="#b45309"/>
						</svg>
					</div>
					<!-- Clock badge -->
					<div class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white dark:bg-warm-800 border-2 border-brand-200 dark:border-brand-700 flex items-center justify-center shadow-md">
						<svg class="w-5 h-5 text-brand-700 dark:text-brand-400" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
						</svg>
					</div>
				</div>

				<!-- Text -->
				<div class="flex flex-col gap-2 max-w-sm">
					<h2 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50 leading-snug">
						Límite de reportes alcanzado
					</h2>
					<p class="text-warm-500 dark:text-warm-400 text-sm leading-relaxed">
						Para mantener la calidad de los reportes, cada persona puede publicar hasta
						<strong class="text-warm-700 dark:text-warm-200 font-semibold">5 reportes por día</strong>.
						Tu límite se renueva mañana.
					</p>
				</div>

				<!-- Info card -->
				<div class="w-full max-w-sm bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-2xl px-5 py-4 text-left">
					<p class="text-xs font-bold text-brand-800 dark:text-brand-300 uppercase tracking-wider mb-2">Mientras tanto</p>
					<ul class="flex flex-col gap-2 text-sm text-warm-600 dark:text-warm-300">
						<li class="flex items-start gap-2">
							<span class="mt-0.5 text-brand-600 dark:text-brand-400 flex-shrink-0">✓</span>
							Tus reportes ya son visibles para la comunidad de San Cristóbal.
						</li>
						<li class="flex items-start gap-2">
							<span class="mt-0.5 text-brand-600 dark:text-brand-400 flex-shrink-0">✓</span>
							Comparte el enlace de tu reporte en grupos de WhatsApp o Facebook.
						</li>
					</ul>
				</div>

				<!-- CTAs -->
				<div class="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
					<a
						href="/"
						class="flex-1 py-3 rounded-2xl font-bold text-sm text-center bg-brand-800 hover:bg-brand-900 text-white shadow-md hover:shadow-lg transition-all"
					>
						Ver reportes activos →
					</a>
					<a
						href="/"
						class="flex-1 py-3 rounded-2xl font-semibold text-sm text-center border-2 border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 hover:border-warm-300 dark:hover:border-warm-600 transition-all"
					>
						Volver al inicio
					</a>
				</div>
			</div>
		{:else}

		<!-- Page title -->
		<div class="mt-7 mb-8">
			<h1 class="font-display text-3xl sm:text-4xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
				Reportar mascota<br>perdida
			</h1>
			<p class="text-warm-500 dark:text-warm-400 mt-2 text-sm">
				Completa los pasos y publicaremos tu reporte en segundos.
			</p>
		</div>

		<!-- Alpha disclaimer -->
		<div class="mb-8">
			<AlphaBanner />
		</div>

		<!-- Step progress indicator -->
		<div class="flex items-center mb-10 px-1">
			{#each STEPS as step, i (i)}
				<div class="flex flex-col items-center gap-1.5 flex-shrink-0">
					<div
						class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 {
							i < currentStep
								? 'bg-brand-800 dark:bg-brand-600 text-white shadow-md'
								: i === currentStep
								? 'bg-brand-800 dark:bg-brand-600 text-white shadow-lg ring-4 ring-brand-100 dark:ring-brand-900'
								: 'bg-white dark:bg-warm-800 text-warm-400 dark:text-warm-500 border-2 border-warm-200 dark:border-warm-700'
						}"
					>
						{#if i < currentStep}
							<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
							</svg>
						{:else}
							{i + 1}
						{/if}
					</div>
					<span class="text-xs font-semibold tracking-wide transition-colors duration-300 {i <= currentStep ? 'text-brand-800 dark:text-brand-400' : 'text-warm-400 dark:text-warm-600'}">
						{step}
					</span>
				</div>
				{#if i < STEPS.length - 1}
					<div class="flex-1 h-[2px] mx-2 mb-5 rounded-full transition-all duration-500 {i < currentStep ? 'bg-brand-800 dark:bg-brand-600' : 'bg-warm-200 dark:bg-warm-700'}"></div>
				{/if}
			{/each}
		</div>

		<!-- Step content with sliding transition -->
		<div style="display: grid; overflow: hidden;">
			{#key currentStep}
				<div
					style="grid-area: 1/1; min-width: 0;"
					in:fly={{ x: animDir * 72, opacity: 0, duration: 370, easing: cubicOut }}
					out:fly={{ x: -animDir * 72, opacity: 0, duration: 370, easing: cubicOut }}
				>

					<!-- ── STEP 0: Especie ── -->
					{#if currentStep === 0}
						<div class="flex flex-col gap-4">
							<SpeciesPicker value={species} onSelect={selectSpecies} />
						</div>

					<!-- ── STEP 1: Physical details ── -->
					{:else if currentStep === 1}
						<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6 flex flex-col gap-5">
							<div class="flex items-center gap-3 pb-3 border-b border-warm-100 dark:border-warm-700">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">
									{species === 'dog' ? '🐶' : species === 'cat' ? '🐱' : '🐾'}
								</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">¿Cómo es tu mascota?</h2>
									<p class="text-xs text-warm-400 dark:text-warm-500">Características que ayudan a identificarla</p>
								</div>
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<div class="sm:col-span-2">
									<label for="color" class={labelClass}>Color <span class="text-red-400">*</span></label>
									<input id="color" type="text" bind:value={color} placeholder="Ej. Negro con manchas blancas" required class={inputClass} />
								</div>
								<div>
									<label for="name" class={labelClass}>Nombre <span class="text-warm-400 font-normal">(opcional)</span></label>
									<input id="name" type="text" bind:value={name} placeholder="Ej. Luna" class={inputClass} />
								</div>
								<div>
									<label for="breed" class={labelClass}>Raza <span class="text-warm-400 font-normal">(opcional)</span></label>
									<input id="breed" type="text" bind:value={breed} placeholder="Ej. Mestizo, Labrador" class={inputClass} />
								</div>
								<div>
									<p class={labelClass}>Sexo</p>
									<Select.Root type="single" value={sex} onValueChange={(v) => (sex = v as typeof sex)}>
										<Select.Trigger class="w-full">
											{sex === 'male' ? 'Macho' : sex === 'female' ? 'Hembra' : 'Desconocido'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="male" label="Macho">Macho</Select.Item>
											<Select.Item value="female" label="Hembra">Hembra</Select.Item>
											<Select.Item value="unknown" label="Desconocido">Desconocido</Select.Item>
										</Select.Content>
									</Select.Root>
								</div>
								<div>
									<p class={labelClass}>Tamaño</p>
									<Select.Root type="single" value={size} onValueChange={(v) => (size = v as typeof size)}>
										<Select.Trigger class="w-full">
											{size === 'small' ? 'Pequeño' : size === 'large' ? 'Grande' : 'Mediano'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="small" label="Pequeño">Pequeño</Select.Item>
											<Select.Item value="medium" label="Mediano">Mediano</Select.Item>
											<Select.Item value="large" label="Grande">Grande</Select.Item>
										</Select.Content>
									</Select.Root>
								</div>
							</div>
						</div>

					<!-- ── STEP 2: Location & time ── -->
					{:else if currentStep === 2}
						<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6 flex flex-col gap-5">
							<div class="flex items-center gap-3 pb-3 border-b border-warm-100 dark:border-warm-700">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">
									📍
								</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">¿Dónde y cuándo?</h2>
									<p class="text-xs text-warm-400 dark:text-warm-500">Esto ayuda a la comunidad a localizarla</p>
								</div>
							</div>

							<div>
								<p class={labelClass}>Colonia donde se perdió <span class="text-red-400">*</span></p>
								{#if coloniaError}
									<p class="text-sm text-red-500">No se pudieron cargar las colonias. Recarga la página.</p>
								{:else if colonias.length === 0}
									<div class="w-full border border-warm-200 dark:border-warm-700 rounded-xl px-4 py-3 bg-warm-50 dark:bg-warm-900 text-sm text-warm-400 dark:text-warm-500">
										Cargando colonias…
									</div>
								{:else}
									<Select.Root type="single" value={colonia_id} onValueChange={(v) => (colonia_id = v)}>
										<Select.Trigger class="w-full">
											{colonias.find(c => c.id === colonia_id)?.name ?? 'Selecciona una colonia'}
										</Select.Trigger>
										<Select.Content class="max-h-60">
											{#each colonias as c (c.id)}
												<Select.Item value={c.id} label={c.name}>{c.name}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								{/if}
							</div>

							<div>
								<p class={labelClass}>Fecha de último avistamiento <span class="text-red-400">*</span></p>
								<Popover.Root bind:open={calendarOpen}>
									<Popover.Trigger>
										{#snippet child({ props })}
											<Button.Root
												{...props}
												variant="outline"
												class="{inputClass} flex items-center justify-between font-normal"
											>
												{calendarValue ? formatDisplayDate(calendarValue) : 'Selecciona una fecha'}
												<svg class="w-4 h-4 shrink-0 text-warm-400" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
												</svg>
											</Button.Root>
										{/snippet}
									</Popover.Trigger>
									<Popover.Content class="w-auto overflow-hidden p-0" align="start">
										<Calendar.Calendar
											type="single"
											bind:value={calendarValue}
											locale="es-MX"
											captionLayout="dropdown"
											maxValue={today(getLocalTimeZone())}
											onValueChange={() => (calendarOpen = false)}
										/>
									</Popover.Content>
								</Popover.Root>
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

					<!-- ── STEP 3: Photos & contact ── -->
					{:else if currentStep === 3}
						<div class="flex flex-col gap-5">
							<!-- Photos -->
							<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6 flex flex-col gap-4">
								<div class="flex items-center gap-3 pb-3 border-b border-warm-100 dark:border-warm-700">
									<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">
										📷
									</div>
									<div>
										<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">
											Fotos <span class="text-warm-400 font-normal text-base">(opcional)</span>
										</h2>
										<p class="text-xs text-warm-400 dark:text-warm-500">Aumenta las chances de encontrarla</p>
									</div>
								</div>
								<PhotoPicker
									multiple
									label="Haz clic para subir fotos"
									hint="JPG, PNG · Máx. 5 MB cada una"
									bind:files={photoFiles}
								/>
							</div>

							<!-- Contact -->
							<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6 flex flex-col gap-5">
								<div class="flex items-center gap-3 pb-3 border-b border-warm-100 dark:border-warm-700">
									<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">
										💬
									</div>
									<div>
										<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">
											Contacto <span class="text-warm-400 font-normal text-base">(opcional)</span>
										</h2>
										<p class="text-xs text-warm-400 dark:text-warm-500">Para que la comunidad pueda avisarte</p>
									</div>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
									<div>
										<label for="whatsapp" class={labelClass}>WhatsApp</label>
										<input id="whatsapp" type="tel" bind:value={contact_whatsapp} placeholder="+52 967 000 0000" class={inputClass} />
									</div>
									<div>
										<label for="contact_name" class={labelClass}>Tu nombre</label>
										<input id="contact_name" type="text" bind:value={contact_name} placeholder="Ej. María" class={inputClass} />
									</div>
								</div>

								<label class="flex items-start gap-3 cursor-pointer group">
									<input type="checkbox" bind:checked={anonymous} class="mt-0.5 w-4 h-4 accent-brand-800" />
									<div>
										<span class="text-sm font-semibold text-warm-700 dark:text-warm-200 group-hover:text-warm-900 dark:group-hover:text-warm-50 transition-colors">Publicar de forma anónima</span>
										<p class="text-xs text-warm-400 dark:text-warm-500 mt-0.5">No se mostrará la información de contacto en el reporte público.</p>
									</div>
								</label>
							</div>

							{#if formError}
								<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
									{formError}
								</div>
							{/if}
						</div>
					{/if}

				</div>
			{/key}
		</div>

		<!-- Navigation -->
		<div class="mt-6">
			{#if currentStep === 0}
				<p class="text-center text-warm-400 dark:text-warm-500 text-xs mt-4">Toca una tarjeta para continuar</p>
			{:else}
				<div class="flex gap-3">
					<button
						onclick={goBack}
						class="flex-shrink-0 px-5 py-3.5 rounded-2xl border-2 border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 font-semibold text-sm hover:border-warm-300 dark:hover:border-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-all"
					>
						← Atrás
					</button>

					{#if currentStep < STEPS.length - 1}
						<button
							onclick={goNext}
							disabled={!canContinue}
							class="flex-1 py-3.5 rounded-2xl font-bold text-base transition-all {
								canContinue
									? 'bg-brand-800 hover:bg-brand-900 text-white shadow-md hover:shadow-lg'
									: 'bg-warm-100 dark:bg-warm-800 text-warm-400 dark:text-warm-600 cursor-not-allowed'
							}"
						>
							Continuar →
						</button>
					{:else}
						<button
							onclick={handleSubmit}
							disabled={submitting}
							class="flex-1 py-3.5 rounded-2xl font-bold text-base transition-all flex items-center justify-center {
								!submitting
									? 'bg-brand-800 hover:bg-brand-900 text-white shadow-md hover:shadow-lg'
									: 'bg-warm-200 dark:bg-warm-800 text-warm-400 dark:text-warm-600 cursor-not-allowed'
							}"
						>
							{#if submitting}
								<span class="flex items-center justify-center">
									<Spinner class="size-5 text-white" />
								</span>
							{:else}
								Publicar reporte →
							{/if}
						</button>
					{/if}
				</div>
			{/if}
		</div>

		{/if}
	</div>
</div>
