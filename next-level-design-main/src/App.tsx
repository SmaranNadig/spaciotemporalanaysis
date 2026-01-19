import React from 'react';
import Dashboard from './pages/Dashboard.tsx';
import { Toaster } from 'sonner';

const App = () => {
    return (
        <div className="min-h-screen">
            <Dashboard />
            <Toaster position="top-right" theme="dark" richColors />
        </div>
    );
};

export default App;
