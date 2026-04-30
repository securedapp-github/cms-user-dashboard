import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from './components/layout/AppLayout';
import { LANGUAGES } from './i18n';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import MyConsents from './pages/MyConsents';
import RaiseDSR from './pages/DSR/RaiseDSR';
import TrackDSR from './pages/DSR/TrackDSR';
import RaiseGrievance from './pages/Grievance/RaiseGrievance';
import GrievanceHistory from './pages/Grievance/GrievanceHistory';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';


function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = LANGUAGES.find(l => l.value === i18n.language);
    document.documentElement.dir = currentLang?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        

        {/* Protected Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          
          <Route path="consents">
            <Route index element={<MyConsents />} />
          </Route>
          
          <Route path="dsr">
            <Route index element={<RaiseDSR />} />
            <Route path="track" element={<TrackDSR />} />
          </Route>
          
          <Route path="grievance">
            <Route index element={<RaiseGrievance />} />
            <Route path="history" element={<GrievanceHistory />} />
          </Route>
          
          <Route path="feedback" element={<Feedback />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
