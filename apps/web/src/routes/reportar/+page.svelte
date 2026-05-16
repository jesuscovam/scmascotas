<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Select } from '@scmascotas/ui';

	type Colonia = { id: string; name: string };

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
	let photoFiles = $state<FileList | null>(null);
	let submitting = $state(false);
	let formError = $state('');

	let currentStep = $state(0);
	let animDir = $state(1);

	const STEPS = ['Tipo', 'Detalles', 'Ubicación', 'Contacto'];

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

	function goNext() {
		animDir = 1;
		currentStep = Math.min(currentStep + 1, STEPS.length - 1);
	}

	function goBack() {
		animDir = -1;
		currentStep = Math.max(currentStep - 1, 0);
	}

	function selectSpecies(s: 'dog' | 'cat' | 'other') {
		species = s;
		setTimeout(() => goNext(), 380);
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
				const err = await res.text();
				formError = err || 'Hubo un error al publicar el reporte.';
				return;
			}

			const { slug, editToken } = await res.json();

			if (photoFiles && photoFiles.length > 0) {
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
		'w-full border border-warm-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all placeholder:text-warm-400';
	const labelClass = 'block text-sm font-semibold text-warm-700 mb-1.5';
</script>

<div
	class="min-h-screen"
	style="background-color: #faf9f7; background-image: radial-gradient(circle, rgba(180,140,60,0.07) 1px, transparent 1px); background-size: 22px 22px;"
>
	<div class="max-w-2xl mx-auto px-4 py-10 pb-24">

		<!-- Back link -->
		<a href="/" class="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-800 transition-colors font-medium">
			<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
			</svg>
			Volver al inicio
		</a>

		<!-- Page title -->
		<div class="mt-7 mb-8">
			<h1 class="font-display text-3xl sm:text-4xl font-bold text-warm-900 leading-tight">
				Reportar mascota<br>perdida
			</h1>
			<p class="text-warm-500 mt-2 text-sm">
				Completa los pasos y publicaremos tu reporte en segundos.
			</p>
		</div>

		<!-- Step progress indicator -->
		<div class="flex items-center mb-10 px-1">
			{#each STEPS as step, i}
				<div class="flex flex-col items-center gap-1.5 flex-shrink-0">
					<div
						class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 {
							i < currentStep
								? 'bg-brand-800 text-white shadow-md'
								: i === currentStep
								? 'bg-brand-800 text-white shadow-lg ring-4 ring-brand-100'
								: 'bg-white text-warm-400 border-2 border-warm-200'
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
					<span class="text-xs font-semibold tracking-wide transition-colors duration-300 {i <= currentStep ? 'text-brand-800' : 'text-warm-400'}">
						{step}
					</span>
				</div>
				{#if i < STEPS.length - 1}
					<div class="flex-1 h-[2px] mx-2 mb-5 rounded-full transition-all duration-500 {i < currentStep ? 'bg-brand-800' : 'bg-warm-200'}"></div>
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

					<!-- ── STEP 0: Pet type ── -->
					{#if currentStep === 0}
						<div class="px-2 pb-6">
							<p class="text-center font-display font-semibold text-warm-800 text-xl mb-1">¿Qué tipo de mascota es?</p>
							<p class="text-center text-warm-400 text-sm mb-8">Elige una tarjeta para comenzar</p>

							<div class="grid grid-cols-3 gap-3 sm:gap-4">

								<!-- Dog -->
								<button
									onclick={() => selectSpecies('dog')}
									class="relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 text-left {
										species === 'dog'
											? 'border-amber-300 shadow-xl shadow-amber-100/80 scale-[1.04] bg-amber-50/60'
											: 'border-warm-200 shadow-sm hover:shadow-lg hover:scale-[1.03] hover:border-amber-200 bg-white'
									}"
								>
									{#if species === 'dog'}
										<div class="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center shadow-sm">
											<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
											</svg>
										</div>
									{/if}
									<div
										class="h-36 sm:h-44 flex items-center justify-center"
										style="background: linear-gradient(150deg, #EDE3CF 0%, #DECCAF 100%);"
									>
										<svg viewBox="0 0 96 96" class="w-20 h-20 sm:w-24 sm:h-24" xmlns="http://www.w3.org/2000/svg">
											<!-- Floppy left ear -->
											<ellipse cx="18" cy="57" rx="13" ry="21" fill="#B8916A" transform="rotate(-9 18 50)"/>
											<ellipse cx="18" cy="59" rx="9" ry="15" fill="#C9A47C" transform="rotate(-9 18 52)"/>
											<!-- Floppy right ear -->
											<ellipse cx="78" cy="57" rx="13" ry="21" fill="#B8916A" transform="rotate(9 78 50)"/>
											<ellipse cx="78" cy="59" rx="9" ry="15" fill="#C9A47C" transform="rotate(9 78 52)"/>
											<!-- Head — warm muted tan -->
											<circle cx="48" cy="52" r="30" fill="#D4B896"/>
											<!-- Snout -->
											<ellipse cx="48" cy="65" rx="18" ry="13" fill="#E2CDB0"/>
											<!-- Left eye — deep warm brown, soulful -->
											<circle cx="36" cy="46" r="7" fill="#2A1A0E"/>
											<circle cx="36" cy="46" r="5" fill="#3D2510"/>
											<circle cx="33.5" cy="43.5" r="1.6" fill="white" opacity="0.5"/>
											<!-- Right eye -->
											<circle cx="60" cy="46" r="7" fill="#2A1A0E"/>
											<circle cx="60" cy="46" r="5" fill="#3D2510"/>
											<circle cx="57.5" cy="43.5" r="1.6" fill="white" opacity="0.5"/>
											<!-- Quiet brow lines — subtle expressiveness -->
											<path d="M29 40 Q36 37 43 39" fill="none" stroke="#B8916A" stroke-width="1.5" stroke-linecap="round" opacity="0.55"/>
											<path d="M53 39 Q60 37 67 40" fill="none" stroke="#B8916A" stroke-width="1.5" stroke-linecap="round" opacity="0.55"/>
											<!-- Nose -->
											<ellipse cx="48" cy="60" rx="8.5" ry="5.5" fill="#6B4A30"/>
											<line x1="48" y1="55.5" x2="48" y2="60" stroke="#6B4A30" stroke-width="1.5" stroke-linecap="round"/>
											<!-- Gentle closed mouth — neutral resting -->
											<path d="M42 68 Q48 70.5 54 68" fill="none" stroke="#9A7054" stroke-width="1.5" stroke-linecap="round"/>
										</svg>
									</div>
									<div class="p-3 text-center">
										<p class="font-display font-bold text-warm-900 text-sm sm:text-base">Perro</p>
										<p class="text-xs text-warm-400 mt-0.5 hidden sm:block">Can doméstico</p>
									</div>
								</button>

								<!-- Cat -->
								<button
									onclick={() => selectSpecies('cat')}
									class="relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 text-left {
										species === 'cat'
											? 'border-slate-300 shadow-xl shadow-slate-100/80 scale-[1.04] bg-slate-50/60'
											: 'border-warm-200 shadow-sm hover:shadow-lg hover:scale-[1.03] hover:border-slate-200 bg-white'
									}"
								>
									{#if species === 'cat'}
										<div class="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center shadow-sm">
											<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
											</svg>
										</div>
									{/if}
									<div
										class="h-36 sm:h-44 flex items-center justify-center"
										style="background: linear-gradient(150deg, #D8E6EE 0%, #C2D4DF 100%);"
									>
										<svg viewBox="0 0 96 96" class="w-20 h-20 sm:w-24 sm:h-24" xmlns="http://www.w3.org/2000/svg">
											<!-- Left ear outer -->
											<polygon points="15,48 27,14 41,46" fill="#8AAAB8"/>
											<!-- Left ear inner -->
											<polygon points="19,45 27,22 37,44" fill="#C4D4DE"/>
											<!-- Right ear outer -->
											<polygon points="55,46 69,14 81,48" fill="#8AAAB8"/>
											<!-- Right ear inner -->
											<polygon points="59,44 69,22 77,45" fill="#C4D4DE"/>
											<!-- Head -->
											<ellipse cx="48" cy="58" rx="32" ry="27" fill="#C8D8E4"/>
											<!-- Left eye dark circle -->
											<circle cx="35" cy="53" r="8" fill="#2A2018"/>
											<circle cx="35" cy="53" r="6" fill="#3A2E20"/>
											<circle cx="33" cy="51" r="1.6" fill="white" opacity="0.45"/>
											<!-- Left upper eyelid — half-lidded slow blink -->
											<path d="M 27 53 Q 35 46 43 53 Z" fill="#C8D8E4"/>
											<path d="M 27 53 Q 35 46.5 43 53" fill="none" stroke="#97B0BE" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
											<!-- Right eye dark circle -->
											<circle cx="61" cy="53" r="8" fill="#2A2018"/>
											<circle cx="61" cy="53" r="6" fill="#3A2E20"/>
											<circle cx="59" cy="51" r="1.6" fill="white" opacity="0.45"/>
											<!-- Right upper eyelid -->
											<path d="M 53 53 Q 61 46 69 53 Z" fill="#C8D8E4"/>
											<path d="M 53 53 Q 61 46.5 69 53" fill="none" stroke="#97B0BE" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
											<!-- Nose — muted dusty rose -->
											<path d="M 44.5 65 L 51.5 65 L 48 69.5 Z" fill="#C4897A"/>
											<line x1="48" y1="61.5" x2="48" y2="65" stroke="#A07068" stroke-width="1.2" stroke-linecap="round"/>
											<!-- Mouth — barely there -->
											<path d="M44.5 69.5 Q42 72 40 71" fill="none" stroke="#8AAAB8" stroke-width="1.2" stroke-linecap="round"/>
											<path d="M51.5 69.5 Q54 72 56 71" fill="none" stroke="#8AAAB8" stroke-width="1.2" stroke-linecap="round"/>
											<!-- Whiskers — soft, refined -->
											<line x1="10" y1="61" x2="30" y2="64" stroke="#8AAAB8" stroke-width="1.1" stroke-linecap="round" opacity="0.5"/>
											<line x1="10" y1="67" x2="30" y2="67.5" stroke="#8AAAB8" stroke-width="1.1" stroke-linecap="round" opacity="0.5"/>
											<line x1="10" y1="73" x2="30" y2="71" stroke="#8AAAB8" stroke-width="1.1" stroke-linecap="round" opacity="0.5"/>
											<line x1="66" y1="64" x2="86" y2="61" stroke="#8AAAB8" stroke-width="1.1" stroke-linecap="round" opacity="0.5"/>
											<line x1="66" y1="67.5" x2="86" y2="67" stroke="#8AAAB8" stroke-width="1.1" stroke-linecap="round" opacity="0.5"/>
											<line x1="66" y1="71" x2="86" y2="73" stroke="#8AAAB8" stroke-width="1.1" stroke-linecap="round" opacity="0.5"/>
										</svg>
									</div>
									<div class="p-3 text-center">
										<p class="font-display font-bold text-warm-900 text-sm sm:text-base">Gato</p>
										<p class="text-xs text-warm-400 mt-0.5 hidden sm:block">Felino doméstico</p>
									</div>
								</button>

								<!-- Other -->
								<button
									onclick={() => selectSpecies('other')}
									class="relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 text-left {
										species === 'other'
											? 'border-stone-300 shadow-xl shadow-stone-100/80 scale-[1.04] bg-stone-50/60'
											: 'border-warm-200 shadow-sm hover:shadow-lg hover:scale-[1.03] hover:border-stone-200 bg-white'
									}"
								>
									{#if species === 'other'}
										<div class="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-stone-500 flex items-center justify-center shadow-sm">
											<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
											</svg>
										</div>
									{/if}
									<div
										class="h-36 sm:h-44 flex items-center justify-center"
										style="background: linear-gradient(150deg, #E8DDD0 0%, #D5C9BA 100%);"
									>
										<svg viewBox="0 0 96 96" class="w-20 h-20 sm:w-24 sm:h-24" xmlns="http://www.w3.org/2000/svg">
											<!-- Main pad -->
											<ellipse cx="48" cy="68" rx="22" ry="18" fill="#A8978A"/>
											<ellipse cx="48" cy="68" rx="18" ry="14" fill="#BEB0A5"/>
											<!-- Toe far-left -->
											<ellipse cx="17" cy="47" rx="11" ry="9.5" fill="#A8978A"/>
											<ellipse cx="17" cy="47" rx="8.5" ry="7.5" fill="#BEB0A5"/>
											<!-- Toe center-left -->
											<ellipse cx="36" cy="36" rx="11" ry="9.5" fill="#A8978A"/>
											<ellipse cx="36" cy="36" rx="8.5" ry="7.5" fill="#BEB0A5"/>
											<!-- Toe center-right -->
											<ellipse cx="60" cy="36" rx="11" ry="9.5" fill="#A8978A"/>
											<ellipse cx="60" cy="36" rx="8.5" ry="7.5" fill="#BEB0A5"/>
											<!-- Toe far-right -->
											<ellipse cx="79" cy="47" rx="11" ry="9.5" fill="#A8978A"/>
											<ellipse cx="79" cy="47" rx="8.5" ry="7.5" fill="#BEB0A5"/>
										</svg>
									</div>
									<div class="p-3 text-center">
										<p class="font-display font-bold text-warm-900 text-sm sm:text-base">Otro</p>
										<p class="text-xs text-warm-400 mt-0.5 hidden sm:block">Ave, conejo…</p>
									</div>
								</button>

							</div>
						</div>

					<!-- ── STEP 1: Physical details ── -->
					{:else if currentStep === 1}
						<div class="bg-white rounded-3xl border border-warm-200 shadow-sm p-6 flex flex-col gap-5">
							<div class="flex items-center gap-3 pb-3 border-b border-warm-100">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">
									{species === 'dog' ? '🐶' : species === 'cat' ? '🐱' : '🐾'}
								</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 text-lg">¿Cómo es tu mascota?</h2>
									<p class="text-xs text-warm-400">Características que ayudan a identificarla</p>
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
						<div class="bg-white rounded-3xl border border-warm-200 shadow-sm p-6 flex flex-col gap-5">
							<div class="flex items-center gap-3 pb-3 border-b border-warm-100">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">
									📍
								</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 text-lg">¿Dónde y cuándo?</h2>
									<p class="text-xs text-warm-400">Esto ayuda a la comunidad a localizarla</p>
								</div>
							</div>

							<div>
								<label for="colonia" class={labelClass}>Colonia donde se perdió <span class="text-red-400">*</span></label>
								{#if coloniaError}
									<p class="text-sm text-red-500">No se pudieron cargar las colonias. Recarga la página.</p>
								{:else if colonias.length === 0}
									<div class="w-full border border-warm-200 rounded-xl px-4 py-3 bg-warm-50 text-sm text-warm-400">
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
								<label for="last_seen_at" class={labelClass}>Fecha de último avistamiento <span class="text-red-400">*</span></label>
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

					<!-- ── STEP 3: Photos & contact ── -->
					{:else if currentStep === 3}
						<div class="flex flex-col gap-5">
							<!-- Photos -->
							<div class="bg-white rounded-3xl border border-warm-200 shadow-sm p-6 flex flex-col gap-4">
								<div class="flex items-center gap-3 pb-3 border-b border-warm-100">
									<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">
										📷
									</div>
									<div>
										<h2 class="font-display font-semibold text-warm-900 text-lg">
											Fotos <span class="text-warm-400 font-normal text-base">(opcional)</span>
										</h2>
										<p class="text-xs text-warm-400">Aumenta las chances de encontrarla</p>
									</div>
								</div>
								<label class="border-2 border-dashed border-warm-200 rounded-2xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all text-center">
									<span class="text-4xl">📷</span>
									<span class="text-sm font-semibold text-warm-700">Haz clic para subir fotos</span>
									<span class="text-xs text-warm-400">JPG, PNG · Máx. 5 MB cada una</span>
									<input type="file" accept="image/*" multiple bind:files={photoFiles} class="hidden" />
								</label>
								{#if photoFiles && photoFiles.length > 0}
									<p class="text-sm text-warm-500 text-center">{photoFiles.length} foto(s) seleccionada(s)</p>
								{/if}
							</div>

							<!-- Contact -->
							<div class="bg-white rounded-3xl border border-warm-200 shadow-sm p-6 flex flex-col gap-5">
								<div class="flex items-center gap-3 pb-3 border-b border-warm-100">
									<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">
										💬
									</div>
									<div>
										<h2 class="font-display font-semibold text-warm-900 text-lg">
											Contacto <span class="text-warm-400 font-normal text-base">(opcional)</span>
										</h2>
										<p class="text-xs text-warm-400">Para que la comunidad pueda avisarte</p>
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
										<span class="text-sm font-semibold text-warm-700 group-hover:text-warm-900 transition-colors">Publicar de forma anónima</span>
										<p class="text-xs text-warm-400 mt-0.5">No se mostrará la información de contacto en el reporte público.</p>
									</div>
								</label>
							</div>

							{#if formError}
								<div class="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
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
				<p class="text-center text-warm-400 text-xs mt-4">Toca una tarjeta para continuar</p>
			{:else}
				<div class="flex gap-3">
					<button
						onclick={goBack}
						class="flex-shrink-0 px-5 py-3.5 rounded-2xl border-2 border-warm-200 text-warm-600 font-semibold text-sm hover:border-warm-300 hover:bg-warm-100 transition-all"
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
									: 'bg-warm-100 text-warm-400 cursor-not-allowed'
							}"
						>
							Continuar →
						</button>
					{:else}
						<button
							onclick={handleSubmit}
							disabled={submitting}
							class="flex-1 py-3.5 rounded-2xl font-bold text-base transition-all {
								!submitting
									? 'bg-brand-800 hover:bg-brand-900 text-white shadow-md hover:shadow-lg'
									: 'bg-warm-200 text-warm-400 cursor-not-allowed'
							}"
						>
							{submitting ? 'Publicando…' : 'Publicar reporte →'}
						</button>
					{/if}
				</div>
			{/if}
		</div>

	</div>
</div>
