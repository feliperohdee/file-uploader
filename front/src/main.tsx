import './index.css';

import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
        <Toaster />
    </StrictMode>
);
