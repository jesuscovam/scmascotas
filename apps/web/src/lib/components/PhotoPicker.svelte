<script lang="ts">
	/**
	 * PhotoPicker — reusable image file picker with live thumbnail previews.
	 *
	 * Usage (single):
	 *   <PhotoPicker bind:files={photoFiles} />
	 *
	 * Usage (multiple):
	 *   <PhotoPicker multiple bind:files={photoFiles} />
	 *
	 * `files` is a `File[]` (not FileList) so individual items can be removed.
	 */

	let {
		multiple = false,
		label = 'Agregar foto',
		hint = 'JPG o PNG · Máx 5 MB',
		files = $bindable<File[]>([])
	}: {
		multiple?: boolean;
		label?: string;
		hint?: string;
		files?: File[];
	} = $props();

	let previewUrls = $state<string[]>([]);

	$effect(() => {
		const urls = files.map((f) => URL.createObjectURL(f));
		previewUrls = urls;
		return () => urls.forEach((u) => URL.revokeObjectURL(u));
	});

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;
		const incoming = Array.from(input.files);
		files = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
		input.value = ''; // allow re-selecting the same file
	}

	function remove(i: number) {
		files = files.filter((_, idx) => idx !== i);
	}
</script>

{#if previewUrls.length > 0}
	<div class="flex flex-wrap items-start gap-3">
		{#each previewUrls as url, i (url)}
			<div class="relative group/thumb shrink-0">
				<img
					src={url}
					alt="Vista previa {i + 1}"
					class="w-24 h-24 object-cover rounded-xl border border-warm-200 dark:border-warm-600 shadow-sm"
				/>
				<button
					type="button"
					onclick={() => remove(i)}
					class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow"
					aria-label="Quitar foto {i + 1}"
				>×</button>
			</div>
		{/each}

		{#if multiple}
			<!-- Add more -->
			<label
				class="w-24 h-24 shrink-0 border-2 border-dashed border-warm-200 dark:border-warm-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-900/10 transition-all text-warm-400 dark:text-warm-500 hover:text-brand-500"
				title="Agregar más fotos"
			>
				<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
				<span class="text-[10px] font-medium mt-1">Más fotos</span>
				<input type="file" accept="image/*" multiple class="hidden" onchange={handleChange} />
			</label>
		{:else}
			<!-- Single file: change / remove actions -->
			<div class="flex flex-col gap-1.5 justify-center">
				<label class="text-sm font-medium text-amber-600 dark:text-amber-400 cursor-pointer hover:underline">
					Cambiar foto
					<input type="file" accept="image/*" class="hidden" onchange={handleChange} />
				</label>
				<button type="button" onclick={() => remove(0)} class="text-sm text-red-400 hover:text-red-600 dark:hover:text-red-400 text-left transition-colors">
					Quitar foto
				</button>
			</div>
		{/if}
	</div>
{:else}
	<label
		class="flex flex-col items-center gap-2 border-2 border-dashed border-warm-200 dark:border-warm-600 rounded-xl p-6 cursor-pointer hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-all text-center"
	>
		<span class="text-3xl select-none">📷</span>
		<span class="text-sm font-medium text-warm-700 dark:text-warm-200">{label}</span>
		<span class="text-xs text-warm-400 dark:text-warm-500">{hint}</span>
		<input type="file" accept="image/*" {multiple} class="hidden" onchange={handleChange} />
	</label>
{/if}
