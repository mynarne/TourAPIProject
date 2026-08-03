import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ExplorePage } from '../pages/ExplorePage';
import { SpotDetailPage } from '../pages/SpotDetailPage';
import { TrafficPage } from '../pages/TrafficPage';
import { ChatbotPage } from '../pages/ChatbotPage';
import { RecordsPage } from '../pages/RecordsPage';
import { RecordDetailPage } from '../pages/RecordDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AuthGuard } from '../features/auth/components/AuthGuard';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/spots/:contentId" element={<SpotDetailPage />} />
          <Route path="/traffic" element={<TrafficPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/records" element={<AuthGuard><RecordsPage /></AuthGuard>} />
          <Route path="/records/:id" element={<AuthGuard><RecordDetailPage /></AuthGuard>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
