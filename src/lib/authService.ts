import createAuth0Client, {
	Auth0Client,
	type LogoutOptions,
	type PopupLoginOptions,
	type RedirectLoginOptions
} from '@auth0/auth0-spa-js';
import { user, isAuthenticated, popupOpen } from '$lib/store';
import { vars } from '$lib/variables';

async function createClient() {
	const res = await fetch(`${vars.api.baseUrl}/auth/config`);

	if (res.ok) {
		const config = await res.json();
		const auth0Client = await createAuth0Client({
			domain: config.domain,
			client_id: config.clientId,
			audience: config.audience
		});

		return auth0Client;
	} else {
		const auth0Client = await createAuth0Client({
			domain: vars.auth0.domain,
			client_id: vars.auth0.clientId,
			audience: vars.auth0.audience
		});

		return auth0Client;
	}
}

async function loginWithRedirect(client: Auth0Client, options: RedirectLoginOptions) {
	try {
		await client.loginWithRedirect(options);
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

function logout(client: Auth0Client, options: LogoutOptions) {
	return client.logout(options);
}

const auth = {
	createClient,
	loginWithPopup,
	loginWithRedirect,
	logout
};

export default auth;
