import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './data/store';
import { restoreUser, stopLoading } from './data/coreSlice';
import { localRoutes, AUTH_USER_KEY } from './data/constants';
import 'react-toastify/dist/ReactToastify.css';

// Import actual components
import Login from './modules/login/Login';
import SignUp from './modules/login/SignUp';
import Dashboard from './modules/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import Contacts from './modules/contacts/Contacts';
import ContactDetail from './modules/contacts/ContactDetail';
import Reports from './modules/reports/Reports';
import ReportSubmissionForm from './modules/reports/ReportSubmissionForm';
import UserManagement from './modules/admin/users/UserManagement';
import ReportConfiguration from './modules/admin/reports/ReportConfiguration';
import Groups from './modules/groups/Groups';
const ForgotPassword = () => <div>Forgot Password - Coming Soon</div>;
const ResetPassword = () => <div>Reset Password - Coming Soon</div>;
const UpdatePasswordConfirmation = () => <div>Update Password - Coming Soon</div>;
const Splash = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px'
  }}>
    Loading...
  </div>
);
const LoaderDialog = ({ open }: { open: boolean }) => 
  open ? (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
    </div>
  ) : null;

function App() {
  const dispatch = useDispatch();
  const { user, isLoadingUser, globalLoader } = useSelector((state: RootState) => state.core);

  useEffect(() => {
    // Try to restore user from localStorage on app start
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(restoreUser(user));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        dispatch(stopLoading());
      }
    } else {
      dispatch(stopLoading());
    }
  }, [dispatch]);

  if (isLoadingUser) {
    return <Splash />;
  }

  return (
    <Router>
      <ToastContainer />
      <LoaderDialog open={globalLoader} />
      {user ? (
        <Layout>
          <Routes>
            <Route path={localRoutes.dashboard} element={<Dashboard />} />
            <Route path={localRoutes.contacts} element={<Contacts />} />
            <Route path={`${localRoutes.contacts}/:contactId`} element={<ContactDetail />} />
            <Route path={localRoutes.reports} element={<Reports />} />
            <Route path={localRoutes.reportSubmit} element={<ReportSubmissionForm />} />
            <Route path={localRoutes.groups} element={<Groups />} />
            <Route path={localRoutes.users} element={<UserManagement />} />
            <Route path={localRoutes.reportConfiguration} element={<ReportConfiguration />} />
            <Route path="/" element={<Dashboard />} />
            {/* We'll add more routes here as we migrate modules */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route
            path={localRoutes.updatePassword}
            element={<UpdatePasswordConfirmation />}
          />
          <Route
            path={localRoutes.resetPassword}
            element={<ResetPassword />}
          />
          <Route
            path={localRoutes.forgotPassword}
            element={<ForgotPassword />}
          />
          <Route path={localRoutes.register} element={<SignUp />} />
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
