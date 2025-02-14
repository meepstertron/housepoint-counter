import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "@/RootLayout";
import useToken from '@/components/useToken';
import Page from "./pages/students";
import Home_Page from "./pages/home";
import LoginPage from '@/pages/login';
import Help_Page from './pages/help';
import About_Page from './pages/about';
import Admin_Page from './pages/admin';
import { isAdmin } from '@/lib/api';
import { AwardHSP } from './pages/awardHousePoints';
import ErrorBoundary from './pages/error/ErrorBoundary';
import Settings_Page from './pages/Settings';
import SettingsLayout from './SettingsLayout';

import Archive_Page from './pages/archive';

const DEBUG_BYPASS_AUTH = false; // set to true to bypass and basically make the page work without an backend server (testing purposes do not ship to prod!)

const App = () => {
  const { token, setToken } = useToken();
  const [isAdminUser, setIsAdminUser] = useState<boolean>(DEBUG_BYPASS_AUTH);
  const [loading, setLoading] = useState<boolean>(!DEBUG_BYPASS_AUTH);

  useEffect(() => {
    async function checkAdminStatus() {
      if (DEBUG_BYPASS_AUTH) {
        setIsAdminUser(true);
        setLoading(false);
        return;
      }
      if (token) {
        try {
          const adminStatus = await isAdmin(token);
          setIsAdminUser(adminStatus);
        } catch (error) {
          console.error(error);
        }
      }
      setLoading(false);
    }
    checkAdminStatus();
  }, [token]);

  if (!token && !DEBUG_BYPASS_AUTH) {
    return <LoginPage setToken={setToken} />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <RootLayout>
                <Home_Page />
              </RootLayout>
            }
          />
          <Route
            path="/about"
            element={
              <RootLayout>
                <About_Page />
              </RootLayout>
            }
          />
          <Route
            path="/students"
            element={
              <RootLayout>
                <Page />
              </RootLayout>
            }
          />
          <Route
            path="/help"
            element={
              <RootLayout>
                <Help_Page />
              </RootLayout>
            }
          />
          <Route
            path="/award"
            element={
              <RootLayout>
                <AwardHSP />
              </RootLayout>
            }
          />
          <Route
            path='/archive'
            element={
              <RootLayout>
                <Archive_Page />
              </RootLayout>
            }/>
          <Route
            path="/admin"
            element={
              isAdminUser ? (
                <RootLayout>
                  <Admin_Page />
                </RootLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/settings" element={<SettingsLayout><Settings_Page /></SettingsLayout>} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
