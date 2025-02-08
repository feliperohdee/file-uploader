const bytesToHumanReadable = (bytes: number) => {
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

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

		headers.set('Access-Control-Allow-Origin', '*');
		headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		headers.set('Access-Control-Allow-Headers', 'Content-Type');

		if (req.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers });
		}

		const id = crypto.randomUUID();

		if (url.pathname === '/upload' && req.method === 'POST') {
			const id = crypto.randomUUID();
			const requestBodyAsArrayBuffer = await req.arrayBuffer();
			const contentType = req.headers.get('content-type');
			const contentLength = req.headers.get('content-length');

			console.log({
				id,
				contentLength: bytesToHumanReadable(Number(contentLength)),
				contentType,
				// requestBodyAsArrayBuffer
			});

			// await env.uploads.put(id, requestBodyAsArrayBuffer);
		}

		return Response.json({ error: 'Not found' }, { status: 404 });
	}
};
