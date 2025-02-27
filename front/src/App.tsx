import { CloudDownload, Upload } from 'lucide-react';
import { useState } from 'react';
import qrcode from 'qrcode';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const apiURL = import.meta.env.PROD
	? 'https://file-upload-server.simpleimg.workers.dev'
	: 'http://localhost:8787';

const UploadForm = () => {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [password, setPassword] = useState('');
	const [passwordEnabled, setPasswordEnabled] = useState(false);
	const [qr, setQR] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [url, setUrl] = useState('');
	const { toast } = useToast();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (file) {
			setSelectedFile(file);
			setMessage('');
			setQR('');
			setUrl('');
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setMessage('');
		setQR('');
		setUrl('');

		if (!selectedFile) {
			setMessage('Por favor, selecione um arquivo.');
			return;
		}

		setLoading(true);

		try {
			const formData = new FormData();

			formData.append('content-type', selectedFile.type);
			formData.append('file', selectedFile);

			if (passwordEnabled && password) {
				formData.append('password', password);
			}

			const res = await fetch(`${apiURL}/upload`, {
				body: formData,
				method: 'POST'
			});

			const json = await res.json();
			const url = `${apiURL}/upload?id=${json.id}`;

			setMessage('Arquivo enviado com sucesso!');
			
			const qr = await qrcode.toDataURL(url);
			
			toast({
				className: 'bg-slate-900 border-slate-800 text-slate-50',
				description: 'Seu arquivo foi enviado com sucesso',
				title: 'Sucesso!',
				variant: 'default'
			});
			
			setQR(qr);
			setUrl(url);
			setSelectedFile(null);
			setPassword('');

			(event.target as HTMLFormElement).reset();
		} catch {
			toast({
				description: 'Erro ao enviar arquivo. Tente novamente.',
				title: 'Erro!',
				variant: 'destructive'
			});
			
			setMessage('Erro ao enviar arquivo. Tente novamente.');
			setQR('');
			setUrl('');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className='mx-auto w-full max-w-md border-slate-800 bg-slate-950 text-slate-50'>
			<CardHeader className='border-b border-slate-800'>
				<CardTitle className='flex items-center gap-2 text-xl font-semibold text-slate-50'>
					<Upload className='h-5 w-5' />
					Upload de Arquivo
				</CardTitle>
			</CardHeader>
			<CardContent className='pt-6'>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					<div className='space-y-2'>
						<Label
							htmlFor='file'
							className='text-slate-200'
						>
							Selecione um arquivo
						</Label>
						<Input
							id='file'
							type='file'
							onChange={handleFileChange}
							className='cursor-pointer border-slate-800 bg-slate-900 text-slate-200 file:border-slate-700 file:bg-slate-800 file:text-slate-200 file:transition-colors hover:file:bg-slate-700'
						/>
					</div>

					<div className='flex items-center justify-between space-x-2'>
						<Label
							htmlFor='password-toggle'
							className='text-slate-200'
						>
							Proteger com senha
						</Label>
						<Switch
							id='password-toggle'
							checked={passwordEnabled}
							onCheckedChange={setPasswordEnabled}
						/>
					</div>

					{passwordEnabled ? (
						<div className='space-y-2'>
							<Label
								htmlFor='password'
								className='text-slate-200'
							>
								Senha
							</Label>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								className='border-slate-800 bg-slate-900 text-slate-200'
								placeholder='Digite a senha'
							/>
						</div>
					) : null}

					{selectedFile ? (
						<div className='text-sm text-slate-400'>
							Arquivo selecionado: {selectedFile.name}
						</div>
					) : null}

					{message ? (
						<Alert
							variant={
								message.includes('sucesso')
									? 'default'
									: 'destructive'
							}
							className={
								message.includes('sucesso')
									? 'border-slate-800 bg-slate-900 text-slate-200'
									: ''
							}
						>
							<AlertDescription className='flex flex-col items-start gap-2'>
								{message}

								{qr ? (
									<img
										alt='QR Code'
										className='overflow-hidden rounded-lg'
										height={150}
										src={qr}
										width={150}
									/>
								) : null}

								{url ? (
									<Button
										className='mt-2 text-slate-900'
										variant={'secondary'}
										asChild
									>
										<a
											href={url}
											target='_blank'
											className='text-slate-200'
										>
											<CloudDownload className='h-4 w-4' />
											Download
										</a>
									</Button>
								) : null}
							</AlertDescription>
						</Alert>
					) : null}

					<Button
						type='submit'
						className='w-full bg-slate-800 text-slate-100 hover:bg-slate-700'
						disabled={loading}
					>
						{loading ? 'Enviando...' : 'Enviar Arquivo'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

const App = () => {
	return (
		<>
			<div className='flex min-h-screen items-center justify-center bg-slate-950'>
				<div className='max-w-xl'>
					<UploadForm />
				</div>
			</div>
		</>
	);
};

export default App;
