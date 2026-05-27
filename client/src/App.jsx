import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';

// Role-Specific Login Pages
import OrganizerLogin from './pages/auth/OrganizerLogin';
import VolunteerLogin from './pages/auth/VolunteerLogin';
import ParticipantLogin from './pages/auth/ParticipantLogin';
import SponsorLogin from './pages/auth/SponsorLogin';

// Portal Landing & Marketing Page
import PortalHome from './pages/PortalHome';
import LandingPage from './pages/LandingPage';

// Dashboards
import OrganizerDashboard from './pages/OrganizerDashboard';
import VolunteerPortal from './pages/VolunteerPortal';
import SponsorMarketplace from './pages/SponsorMarketplace';
import ParticipantPanel from './pages/ParticipantPanel';
import ParticipantProfile from './pages/ParticipantProfile';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div style={{ minHeight: '100vh', background: '#08080A' }}>
          <div className="bg-ambient" />
          <div className="bg-grid" />
          <Routes>
            {/* Home — Public Marketing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Portal Selection / Login Gateway */}
            <Route path="/login" element={<ParticipantLogin />} />

            {/* Role-Specific Login Gates */}
            <Route path="/login/organizer" element={<OrganizerLogin />} />
            <Route path="/login/volunteer" element={<VolunteerLogin />} />
            <Route path="/login/participant" element={<ParticipantLogin />} />
            <Route path="/login/sponsor" element={<SponsorLogin />} />

            {/* Protected Dashboards */}
            <Route
              path="/dashboard/organizer"
              element={
                <ProtectedRoute allowedRole="organizer">
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/volunteer"
              element={
                <ProtectedRoute allowedRole="volunteer">
                  <VolunteerPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/sponsor"
              element={
                <ProtectedRoute allowedRole="sponsor">
                  <SponsorMarketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/participant"
              element={
                <ProtectedRoute allowedRole="participant">
                  <ParticipantPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/participant/profile"
              element={
                <ProtectedRoute allowedRole="participant">
                  <ParticipantProfile />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
