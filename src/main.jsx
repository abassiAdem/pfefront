import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './Store/store.jsx';
import App from './App.jsx'
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "../src/component/theme-provider";

createRoot(document.getElementById('root')).render(
<StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="light">
        <App />
        <Toaster position="top-right"    richColors />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW failed:', err))
  })
}
