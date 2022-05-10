import { vars } from '$lib/variables';
import { get } from 'svelte/store';
import { auth0Client } from './store';

/**
 * Call api using authentication. Cannot be used in modules
 * @param url The url to call
 * @param method The http method to use
 * @param body The body of the request (OPTIONAL)
 * @returns The string with the JSON response
 */
export const callApiAuth = async (url: string, method: string, body?: string): Promise<string> => {
	try {
		let token = '';

		const client = get(auth0Client);
		if (client) {
			token = await client.getTokenSilently();
		} else {
			return '';
		}

		const bearer = 'Bearer ' + token;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let headers: any = { Authorization: bearer };

		if (method.toLowerCase() == 'post') {
			headers = {
				Authorization: bearer,
				'content-type': 'application/json'
			};
		}

		const res = await fetch(`${vars.api.baseUrl}${url}`, {
			headers: headers,
			method,
			body
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

/**
 * Call api without using authentication. Can be used in modules
 * @param url The url to call
 * @param method The http method to use
 * @param body The body of the request (OPTIONAL)
 * @returns The string with the JSON response
 */
export const callApi = async (url: string, method: string, body?: string): Promise<string> => {
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
			method,
			body
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
