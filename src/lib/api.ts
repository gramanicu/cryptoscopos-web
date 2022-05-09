import { vars } from '$lib/variables';
import { get } from 'svelte/store';
import { auth0Client } from './store';

export const callApiAuth = async (url: string, method: string): Promise<string> => {
	try {
		let token = '';

		const client = get(auth0Client);
		if (client) {
			token = await client.getTokenSilently();
		}

		const bearer = 'Bearer ' + token;
		const headers = { Authorization: bearer };

		const res = await fetch(`${vars.api.baseUrl}${url}`, {
			headers: headers,
			method
		});

		if (res.ok) {
			const data: string = JSON.stringify(await res.json());
			return data;
		} else {
			return '';
		}
	} catch (e) {
		console.error(e);
	}
	return '';
};
