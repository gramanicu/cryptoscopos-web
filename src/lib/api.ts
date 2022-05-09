import { vars } from '$lib/variables';
import auth from './authService';

export const callApiAuth = async (url: string, method: string): Promise<string> => {
	const auth0Client = await auth.createClient();
	try {
		const token = await auth0Client.getTokenSilently();
		const bearer = 'Bearer ' + token;

		const res = await fetch(`${vars.api.baseUrl}${url}`, {
			headers: { Authorization: bearer },
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
