/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		// If you want to use on:beforeinstallprompt
		onbeforeinstallprompt?: (event: any) => any;
		// If you want to use myCustomAttribute={..} (note: all lowercase)
		onenterViewport?: any;
		// You can replace any with something more specific if you like
	}
}
