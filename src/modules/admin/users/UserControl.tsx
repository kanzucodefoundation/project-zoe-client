import React from "react";
import Users from "./Users";
import Roles from "./Roles";
import { useSelector } from "react-redux";
import Layout from "../../../components/layout/Layout";
import TabbedView from "../../groups/TabbedView";
import { appPermissions } from "../../../data/constants";
import { hasRole } from "../../../data/appRoles";

export default function UserControl() {
  const user = useSelector((state: any) => state.core.user);
  const found = hasRole(user, appPermissions.roleEdit);
  const tabs: any[] = [
    {
      name: "Users",
      component: <Users />,
    },
  ];

  if (found) {
    tabs.push({
      name: "Manage Roles",
      component: <Roles />,
    });
  }

  return (
    <Layout>
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
