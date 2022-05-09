import type { RequestHandler } from '@sveltejs/kit';

export const post: RequestHandler = async (req) => {
	// TODO - the email should be stored somewhere
	const email = (await req.request.json()).email;

	console.log(email);

	return {
		status: 200
	};
};
