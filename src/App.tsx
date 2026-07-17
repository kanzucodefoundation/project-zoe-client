import { useEffect } from 'react';
import type { ReactElement } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './data/store';
import { restoreUser, logout } from './data/coreSlice';
import {
  localRoutes,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  appPermissions,
} from './data/constants';
import { isTokenExpired } from './utils/ajax';
import {
  attendanceViewCapabilities,
  hasAnyCapability,
  taskViewCapabilities,
} from './utils/permissions';
import 'react-toastify/dist/ReactToastify.css';

// Import actual components
import Login from './modules/login/Login';
import ForgotPassword from './modules/login/ForgotPassword';
import SignUp from './modules/login/SignUp';
import ResetPassword from './modules/login/ResetPassword';
import UpdatePasswordConfirmation from './modules/login/UpdatePasswordConfirmation';
import Dashboard from './modules/dashboard/Dashboard';
import Contacts from './modules/contacts/Contacts';
import ContactDetail from './modules/contacts/ContactDetail';
import Reports from './modules/reports/Reports';
import ReportSubmissionForm from './modules/reports/ReportSubmissionForm';
import UserManagement from './modules/admin/users/UserManagement';
import ReportConfiguration from './modules/admin/reports/ReportConfiguration';
import Groups from './modules/groups/Groups';
import GroupDetails from './modules/groups/GroupDetails';
import LayoutV2 from './components/layout-v2/LayoutV2.tsx';
import PwaInstallPrompt from './pwa/PwaInstallPrompt';
import FinancialAccounts from './modules/finance/FinancialAccounts';
import ImportTransactions from './modules/finance/ImportTransactions';
import Reconciliation from './modules/finance/Reconciliation';
import Distributions from './modules/finance/Distributions';
import CategoryRules from './modules/finance/CategoryRules';
import FinancialReports from './modules/finance/FinancialReports';
import TaskQueue from './modules/tasks/TaskQueue';
import MyTasks from './modules/tasks/MyTasks';
import AssignTasks from './modules/tasks/AssignTasks';
import RetentionReport from './modules/reports/RetentionReport';
import ManageNotifications from './modules/admin/notifications/ManageNotifications';
import CheckInScreen from './modules/attendance/CheckInScreen';
import ServiceSchedules from './modules/attendance/schedules/ServiceSchedules';
import AttendanceHistory from './modules/attendance/history/AttendanceHistory';

const Splash = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
    }}
  >
    Loading...
  </div>
);
const LoaderDialog = ({ open }: { open: boolean }) =>
  open ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
    </div>
  ) : null;

function App() {
  const dispatch = useDispatch();
  const { user, isLoadingUser, globalLoader } = useSelector(
    (state: RootState) => state.core,
  );

  useEffect(() => {
    // Try to restore user from localStorage on app start
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (storedUser && token && !isTokenExpired(token)) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(restoreUser(user));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        dispatch(logout());
      }
    } else {
      dispatch(logout());
    }
  }, [dispatch]);

  if (isLoadingUser) {
    return <Splash />;
  }

  const renderProtectedElement = (
    element: ReactElement,
    requiredCapabilities?: string[],
  ) =>
    hasAnyCapability(user, requiredCapabilities) ? (
      element
    ) : (
      <Navigate to={localRoutes.dashboard} replace />
    );

  return (
    <Router>
      <ToastContainer
        position="top-center"
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        style={{
          width: 'min(calc(100vw - 16px), 420px)',
          top: 'max(8px, env(safe-area-inset-top))',
        }}
      />
      <LoaderDialog open={globalLoader} />
      <PwaInstallPrompt />
      {user ? (
        <LayoutV2>
          <Routes>
            <Route path={localRoutes.dashboard} element={<Dashboard />} />
            <Route
              path={localRoutes.contacts}
              element={renderProtectedElement(<Contacts />, [
                appPermissions.roleCrmView,
                appPermissions.roleCrmEdit,
              ])}
            />
            <Route
              path={`${localRoutes.contacts}/:contactId`}
              element={renderProtectedElement(<ContactDetail />, [
                appPermissions.roleCrmView,
                appPermissions.roleCrmEdit,
              ])}
            />
            <Route
              path={localRoutes.reports}
              element={renderProtectedElement(<Reports />, [
                appPermissions.roleReportView,
              ])}
            />
            <Route
              path={localRoutes.reportSubmit}
              element={renderProtectedElement(<ReportSubmissionForm />, [
                appPermissions.roleReportView,
              ])}
            />
            <Route
              path={localRoutes.groups}
              element={renderProtectedElement(<Groups />, [
                appPermissions.roleGroupView,
                appPermissions.roleGroupEdit,
              ])}
            />
            <Route
              path={localRoutes.groupsDetails}
              element={renderProtectedElement(<GroupDetails />, [
                appPermissions.roleGroupView,
                appPermissions.roleGroupEdit,
              ])}
            />
            <Route
              path={localRoutes.users}
              element={renderProtectedElement(<UserManagement />, [
                appPermissions.roleUserView,
                appPermissions.roleUserEdit,
              ])}
            />
            <Route
              path={localRoutes.reportConfiguration}
              element={renderProtectedElement(<ReportConfiguration />, [
                appPermissions.roleUserView,
                appPermissions.roleUserEdit,
              ])}
            />
            <Route
              path={localRoutes.financialAccounts}
              element={renderProtectedElement(<FinancialAccounts />, [
                appPermissions.roleFinanceView,
                appPermissions.roleFinanceEdit,
              ])}
            />
            <Route
              path={localRoutes.financialImport}
              element={renderProtectedElement(<ImportTransactions />, [
                appPermissions.roleFinanceView,
                appPermissions.roleFinanceEdit,
              ])}
            />
            <Route
              path={localRoutes.financialReconciliation}
              element={renderProtectedElement(<Reconciliation />, [
                appPermissions.roleFinanceView,
                appPermissions.roleFinanceEdit,
              ])}
            />
            <Route
              path={localRoutes.financialDistributions}
              element={renderProtectedElement(<Distributions />, [
                appPermissions.roleFinanceView,
                appPermissions.roleFinanceEdit,
              ])}
            />
            <Route
              path={localRoutes.financialCategoryRules}
              element={renderProtectedElement(<CategoryRules />, [
                appPermissions.roleFinanceView,
                appPermissions.roleFinanceEdit,
              ])}
            />
            <Route
              path={localRoutes.financialReports}
              element={renderProtectedElement(<FinancialReports />, [
                appPermissions.roleFinanceView,
                appPermissions.roleFinanceEdit,
              ])}
            />
            <Route
              path={localRoutes.tasks}
              element={renderProtectedElement(
                <TaskQueue />,
                taskViewCapabilities,
              )}
            />
            <Route
              path={localRoutes.tasksMine}
              element={renderProtectedElement(
                <MyTasks />,
                taskViewCapabilities,
              )}
            />
            <Route
              path={localRoutes.tasksAssign}
              element={renderProtectedElement(
                <AssignTasks />,
                taskViewCapabilities,
              )}
            />
            <Route
              path={localRoutes.retentionReport}
              element={renderProtectedElement(<RetentionReport />, [
                appPermissions.roleReportView,
              ])}
            />
            <Route
              path={localRoutes.notifications}
              element={renderProtectedElement(<ManageNotifications />, [
                appPermissions.roleUserView,
                appPermissions.roleUserEdit,
              ])}
            />
            <Route
              path={localRoutes.attendance}
              element={renderProtectedElement(
                <CheckInScreen />,
                attendanceViewCapabilities,
              )}
            />
            <Route
              path={localRoutes.attendanceSchedules}
              element={renderProtectedElement(
                <ServiceSchedules />,
                attendanceViewCapabilities,
              )}
            />
            <Route
              path={localRoutes.attendanceHistory}
              element={renderProtectedElement(
                <AttendanceHistory />,
                attendanceViewCapabilities,
              )}
            />
            <Route path="/" element={<Dashboard />} />
            {/* We'll add more routes here as we migrate modules */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </LayoutV2>
      ) : (
        <Routes>
          <Route
            path={localRoutes.updatePassword}
            element={<UpdatePasswordConfirmation />}
          />
          <Route path={localRoutes.resetPassword} element={<ResetPassword />} />
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
