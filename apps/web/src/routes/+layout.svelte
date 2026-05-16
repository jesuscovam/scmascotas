<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-warm-50">
	<header class="border-b border-warm-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 group">
				<span class="text-2xl">🐾</span>
				<span class="font-display font-bold text-brand-900 text-xl tracking-tight group-hover:text-brand-700 transition-colors">
					SC Pets
				</span>
			</a>
			<nav class="flex items-center gap-4">
				<a href="/acerca" class="text-sm text-warm-500 hover:text-warm-700 transition-colors font-medium">
					Acerca
				</a>
				<a
					href="/reportar"
					class="bg-brand-800 hover:bg-brand-900 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
				>
					+ Reportar mascota
				</a>
			</nav>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-warm-200 bg-white mt-16">
		<div class="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-warm-500">
			<p>
				🐾 <span class="font-semibold text-warm-700">SC Pets</span> — Registro comunitario de mascotas perdidas
			</p>
			<p>
				San Cristóbal de las Casas, Chiapas ·
				<a
					href="https://github.com/scpets/scpets"
					class="underline hover:text-warm-700 transition-colors"
					target="_blank"
					rel="noopener noreferrer"
				>Código abierto</a>
			</p>
		</div>
	</footer>
</div>
