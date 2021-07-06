import React, { Suspense } from "react";
import { Link, Route, Switch } from "react-router-dom";
import { appPermissions, localRoutes } from "../data/constants";
import Layout from "../components/layout/Layout";
import { useSelector } from "react-redux";
import { IState } from "../data/types";
import { hasAnyRole } from "../data/appRoles";
import Loading from "../components/Loading";

//const Events= React.lazy(() => import( "./events/EventsList"));
//const GroupReports = React.lazy(() => import("./events/GroupReports"));

const UserControl = React.lazy(() => import("./admin/users/UserControl"));

const Dashboard = React.lazy(() => import("./dashboard/Dashboard"));
const Contacts = React.lazy(() => import("./contacts/Contacts"));
const ContactDetails = React.lazy(
  () => import("./contacts/details/ContactDetails")
);
const Settings = React.lazy(() => import("./settings/Settings"));
const Groups = React.lazy(() => import("./groups/GroupTabView"));
const GroupDetails = React.lazy(() => import("./groups/Details"));
const MembersEditor = React.lazy(
  () => import("./groups/members/MembersEditor")
);
const UpdatePasswordConfirmation = React.lazy(
  () => import("./login/UpdatePasswordConfirmation")
);
const EventDetails = React.lazy(() => import("./events/details/EventDetails"));
const EventReports = React.lazy(() => import("./events/EventReports"));
const Help = React.lazy(() => import("./help/Help"));

const ContentSwitch = () => {
  const user = useSelector((state: IState) => state.core.user);
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route exact={true} path="/" component={Dashboard} />
        <Route path={localRoutes.dashboard} component={Dashboard} />

        <Route path={localRoutes.contactsDetails} component={ContactDetails} />
        {hasAnyRole(user, [
          appPermissions.roleCrmEdit,
          appPermissions.roleCrmView,
        ]) && <Route path={localRoutes.contacts} component={Contacts} />}

        {hasAnyRole(user, [
          appPermissions.roleUserEdit,
          appPermissions.roleUserView,
        ]) && <Route path={localRoutes.users} component={UserControl} />}

        {hasAnyRole(user, [
          appPermissions.roleGroupEdit,
          appPermissions.roleGroupView,
        ]) && (
          <Route path={localRoutes.groupsDetails} component={GroupDetails} />
        )}

        {hasAnyRole(user, [
          appPermissions.roleGroupEdit,
          appPermissions.roleGroupView,
        ]) && <Route path={localRoutes.groups} component={Groups} />}

        {hasAnyRole(user, [
          appPermissions.roleEventView,
          appPermissions.roleEventEdit,
        ]) && (
          <Route path={localRoutes.eventsDetails} component={EventDetails} />
        )}

        {hasAnyRole(user, [
          appPermissions.roleEventView,
          appPermissions.roleEventEdit,
        ]) && <Route path={localRoutes.events} component={EventReports} />}

        <Route path={localRoutes.settings} component={Settings} />
        <Route path={localRoutes.test} component={Testing} />
        <Route
          path={localRoutes.updatePassword}
          component={UpdatePasswordConfirmation}
        />
        <Route path={localRoutes.help} component={Help} />
        <Route component={NoMatch} />
      </Switch>
    </Suspense>
  );
};

const Testing = () => (
  <Layout>
    <MembersEditor group={{ id: 1 }} done={() => undefined} />
  </Layout>
);

const NoMatch = () => (
  <Layout>
    <h2>Oops nothing here!!</h2>
    <Link to="/">Take me home</Link>
  </Layout>
);

export default ContentSwitch;
