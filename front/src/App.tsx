import { Upload } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const UploadForm = () => {
    const { toast } = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            setSelectedFile(file);
            setMessage('');
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedFile) {
            setMessage('Por favor, selecione um arquivo.');
            return;
        }

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setMessage('Arquivo enviado com sucesso!');
            setSelectedFile(null);

            toast({
                className: 'bg-slate-900 border-slate-800 text-slate-50',
                description: 'Seu arquivo foi enviado com sucesso',
                title: 'Sucesso!',
                variant: 'default'
            });

            (event.target as HTMLFormElement).reset();
        } catch {
            setMessage('Erro ao enviar arquivo. Tente novamente.');

            toast({
                description: 'Erro ao enviar arquivo. Tente novamente.',
                title: 'Erro!',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
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
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    ) : null}

                    <Button
                        type='submit'
                        className='w-full bg-slate-800 text-slate-100 hover:bg-slate-700'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enviando...' : 'Enviar Arquivo'}
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
