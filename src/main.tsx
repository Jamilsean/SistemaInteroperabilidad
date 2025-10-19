 import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import 'swiper/swiper.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.tsx'
import { Toaster } from 'sonner'
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes/>
      <Toaster position="top-center" richColors />
     </AuthProvider>
</BrowserRouter>
)
