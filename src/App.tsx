import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./modules/login/Login";
import Splash from "./modules/login/Splash";
import { useSelector } from "react-redux";
import LoaderDialog from "./components/LoaderDialog";
import { localRoutes } from "./data/constants";
import Register from "./modules/login/Register";
import ForgotPassword from "./modules/login/ForgotPassword";
import ResetPassword from "./modules/login/ResetPassword";
import UpdatePasswordConfirmation from "./modules/login/UpdatePasswordConfirmation";

import ContentSwitch from "./modules/ContentSwitch";

const App: React.FC = () => {
  const coreState: any = useSelector((state: any) => state.core);
  const { isLoadingUser, user, globalLoader } = coreState;
  if (isLoadingUser) {
    return <Splash />;
  } else {
    return (
      <Router>
        <ToastContainer />
        <>
          <LoaderDialog open={globalLoader} />
          {user ? (
            <ContentSwitch />
          ) : (
            <Switch>
              <Route
                path={localRoutes.updatePassword}
                component={UpdatePasswordConfirmation}
              />
              <Route
                path={localRoutes.resetPassword}
                component={ResetPassword}
              />
              <Route
                path={localRoutes.forgotPassword}
                component={ForgotPassword}
              />
              <Route path={localRoutes.login} component={Login} />
              <Route component={Register} />
            </Switch>
          )}
        </>
      </Router>
    );
  }
};

export default App;
