const ONE_MINUTE_IN_SECONDS = 60;

export default {
	async fetch(
		req: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const headers = new Headers();
		const url = new URL(req.url);

		if (url.pathname.includes('favicon.ico')) {
			return new Response(null, { status: 204 });
		}

		// CORS headers
		headers.set('Access-Control-Allow-Origin', '*');
		headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		headers.set('Access-Control-Allow-Headers', 'Content-Type');

		if (req.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers });
		}

		if (url.pathname === '/upload') {
			// get
			if (req.method === 'GET') {
				const id = url.searchParams.get('id');

				if (!id) {
					return Response.json(
						{ error: 'ID is required' },
						{ status: 400, headers }
					);
				}

				const file = await env.uploads.getWithMetadata<{
					contentType: string;
				}>(id, 'arrayBuffer');

				if (!file.value) {
					return Response.json(
						{ error: 'File not found' },
						{ status: 404 }
					);
				}

				const contentType =
					file.metadata?.contentType || 'application/octet-stream';

				return new Response(file.value, {
					headers: {
						'content-type': contentType
					}
				});
			}

			// save
			if (req.method === 'POST') {
				const id = crypto.randomUUID();
				const requestBodyAsArrayBuffer = await req.arrayBuffer();
				const contentType = req.headers.get('content-type');

				await env.uploads.put(id, requestBodyAsArrayBuffer, {
					expirationTtl: ONE_MINUTE_IN_SECONDS,
					metadata: {
						contentType
					}
				});

				return Response.json({ id }, { headers });
			}
		}

		return Response.json(
			{
				error: 'Not found'
			},
			{ status: 404, headers }
		);
	}
};
