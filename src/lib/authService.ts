import createAuth0Client, { Auth0Client, type PopupLoginOptions } from '@auth0/auth0-spa-js';
import { user, isAuthenticated, popupOpen } from '$lib/store';
import { vars } from '$lib/variables';

async function createClient() {
	const auth0Client = await createAuth0Client({
		domain: vars.domain,
		client_id: vars.clientId
	});

	return auth0Client;
}

async function loginWithPopup(client: Auth0Client, options: PopupLoginOptions) {
	popupOpen.set(true);
	try {
		await client.loginWithPopup(options);
		const newUser = await client.getUser();

		if (newUser) {
			user.set(newUser);
			isAuthenticated.set(true);
		}
	} catch (e) {
		// eslint-disable-next-line
		console.error(e);
	} finally {
		popupOpen.set(false);
	}
}

function logout(client: Auth0Client) {
	return client.logout();
}

const auth = {
	createClient,
	loginWithPopup,
	logout
};

export default auth;
