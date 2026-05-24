import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRouter from '@/routes/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        gutter={8}
        containerStyle={{ top: 20, right: 20 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-alt)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            boxShadow:
              '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99,102,241,0.08)',
            padding: '12px 16px',
            maxWidth: '380px',
            lineHeight: 1.5,
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-surface)',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--color-surface)',
            },
          },
          loading: {
            iconTheme: {
              primary: 'var(--color-indigo)',
              secondary: 'var(--color-surface)',
            },
          },
        }}
      />

      <AppRouter />
    </BrowserRouter>
  )
}