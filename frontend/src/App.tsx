import { AppRouter } from './routes/AppRouter';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { LanguageProvider } from './i18n';

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  useEffect(() => { void hydrate(); }, [hydrate]);
  return (
    <LanguageProvider>
      <AppRouter />
    </LanguageProvider>
  );
}
