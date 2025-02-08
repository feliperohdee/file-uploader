const ONE_MINUTE_IN_SECONDS = 60;

const htmlWithPasswordPrompt = () => {
	return `<html>
			<head>
				<title>Digite a senha para baixar o arquivo</title>
			</head>
			<body></body>
			<script>
				const password = window.prompt('Digite a senha para baixar o arquivo');
				const url = new URL(window.location.href);

				url.searchParams.set('password', password);

				window.location.href = url.toString();
			</script>
		</html>`;
};

const handler = {
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
				const password = url.searchParams.get('password');

				if (!id) {
					return Response.json(
						{ error: 'ID is required' },
						{ status: 400, headers }
					);
				}

				const file = await env.uploads.getWithMetadata<{
					contentType: string;
					password: string;
				}>(id, 'arrayBuffer');

				if (!file.value) {
					return Response.json(
						{ error: 'File not found' },
						{ status: 404 }
					);
				}

				if (file.metadata?.password) {
					if (password !== file.metadata.password) {
						return new Response(htmlWithPasswordPrompt(), {
							headers: {
								'content-type': 'text/html'
							}
						});
					}
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
				const requestBodyAsFormData = await req.formData();
				const contentType = requestBodyAsFormData.get('content-type');
				const fileBlob = requestBodyAsFormData.get('file') as Blob;

				await env.uploads.put(id, await fileBlob.arrayBuffer(), {
					expirationTtl: ONE_MINUTE_IN_SECONDS,
					metadata: {
						contentType,
						password: requestBodyAsFormData.get('password') || ''
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

export default handler;
