 import { svelte } from '@sveltejs/vite-plugin-svelte';
import adapter from 'sveltekit-adapter-chrome-extension';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        appDir: 'app',
    },
};

export default config;