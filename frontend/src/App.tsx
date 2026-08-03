import { AppRouter } from './routes/AppRouter';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  useEffect(() => { void hydrate(); }, [hydrate]);
  return <AppRouter />;
}
