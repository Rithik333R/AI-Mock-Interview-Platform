import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ResumePage from '@/pages/resume/ResumePage'
import InterviewsPage from '@/pages/interviews/InterviewsPage'
import InterviewSessionPage from '@/pages/interviews/InterviewSessionPage'
import InterviewReportPage from '@/pages/interviews/InterviewReportPage'
import SkillGapPage from '@/pages/skillgap/SkillGapPage'
import RoadmapPage from '@/pages/roadmap/RoadmapPage'
import ProfilePage from '@/pages/profile/ProfilePage'

export default function AppRouter() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/interviews/:id/session" element={<InterviewSessionPage />} />
            <Route path="/interviews/:id/report" element={<InterviewReportPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Utility routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function PlaceholderPage({ name }) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      <span
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          background:
            'linear-gradient(135deg, var(--color-indigo-light), var(--color-cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        MockIQ
      </span>

      <span
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        {name}
      </span>

      <span
        style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--color-indigo-light)',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.20)',
        }}
      >
        Coming soon
      </span>
    </div>
  )
}

const NotFoundPage = () => <PlaceholderPage name="404 - Not Found" />