import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sentrySvelteKit({
        org: "midnight-ouizard",
        project: "sc-mascotas"
    }), tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['bits-ui', '@scmascotas/ui', '@lucide/svelte']
	}
});
