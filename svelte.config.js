import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		implementation: 'sass'
	}),

	kit: {
		adapter: adapter(),
		vite: {
			resolve: {
				alias: {
					$components: path.resolve('./src/components'),
					$scss: path.resolve('./src/scss'),
					$lib: path.resolve('./src/lib')
				}
			}
		}
	}
};

export default config;
