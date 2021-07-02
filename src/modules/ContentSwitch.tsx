import React from "react";
import { Link, Route, Switch } from "react-router-dom";
import { appPermissions, localRoutes } from "../data/constants";
import Dashboard from "./dashboard/Dashboard";
import Contacts from "./contacts/Contacts";
import ContactDetails from "./contacts/details/ContactDetails";
import Settings from "./settings/Settings";
import Layout from "../components/layout/Layout";
import Groups from "./groups/GroupTabView";
import GroupDetails from "./groups/Details";
import { useSelector } from "react-redux";
import { IState } from "../data/types";
import MembersEditor from "./groups/members/MembersEditor";
import { hasAnyRole } from "../data/appRoles";
import UpdatePasswordConfirmation from "./login/UpdatePasswordConfirmation";
import EventDetails from "./events/details/EventDetails";
import GroupReports from "./events/GroupReports";
import Help from "./help/Help";
import UserControl from "./admin/users/UserControl";

const ContentSwitch = () => {
  const user = useSelector((state: IState) => state.core.user);

  return (
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
      ]) && <Route path={localRoutes.groupsDetails} component={GroupDetails} />}

      {hasAnyRole(user, [
        appPermissions.roleGroupEdit,
        appPermissions.roleGroupView,
      ]) && <Route path={localRoutes.groups} component={Groups} />}

      {hasAnyRole(user, [
        appPermissions.roleEventView,
        appPermissions.roleEventEdit,
      ]) && <Route path={localRoutes.eventsDetails} component={EventDetails} />}

      {hasAnyRole(user, [
        appPermissions.roleEventView,
        appPermissions.roleEventEdit,
      ]) && <Route path={localRoutes.events} component={GroupReports} />}

      <Route path={localRoutes.settings} component={Settings} />
      <Route path={localRoutes.test} component={Testing} />
      <Route
        path={localRoutes.updatePassword}
        component={UpdatePasswordConfirmation}
      />
      <Route path={localRoutes.help} component={Help} />
      <Route component={NoMatch} />
    </Switch>
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
