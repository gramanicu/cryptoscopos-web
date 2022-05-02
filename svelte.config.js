import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		implementation: 'sass'
	}),

	kit: {
		adapter: adapter()
	}
};

export default config;
