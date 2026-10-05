import { Button } from '@heroui/react';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { ThemeProvider } from './context/ThemeContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { Navigate ,Route ,Routes} from 'react-router';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import {useAuth} from '@clerk/react';
import PageLoader from './components/PageLoader';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import {Toaster} from 'react-hot-toast';
import { setAuthToken, setTokenGetter } from './libs/axios';

function App() {
  
  const {isSignedIn , isLoaded, getToken} = useAuth();

  // const {checkAuth ,isCheckingAuth ,  chearAuth} = useAuthStore();

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Provide the getToken function to axios for automatic token refresh
  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if(!isLoaded) return;

    if(isSignedIn) {
      // Get the Clerk session token and set it on axios for authenticated requests
      getToken().then((token) => {
        setAuthToken(token);
        checkAuth();
      });
    } else {
      setAuthToken(null);
      clearAuth(); 
    }
  
  }, [checkAuth , clearAuth , isSignedIn , isLoaded, getToken]);
  
  if(!isLoaded || (isSignedIn && isCheckingAuth)) {
    return <PageLoader/>
  }

  return (
    <ThemeProvider>
    <WallpaperProvider>
      <Routes>
        <Route path="/" element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace /> } />
        <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace /> } />
      </Routes>
      <Toaster />
    </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App
