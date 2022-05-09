import { vars } from '$lib/variables';

export const callApiAuth = async (url: string, method: string, token?: string): Promise<string> => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let headers: any = {};

		if (token) {
			const bearer = 'Bearer ' + token;
			headers = { Authorization: bearer };
		}

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
