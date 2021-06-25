import React from "react";
import Users from "./Users";
import UserRoles from "./UserRoles";
import { useSelector } from "react-redux";
import Layout from "../../../components/layout/Layout";
import TabbedView from "../../groups/TabbedView";
import { roleAdmin } from "../../../data/constants";
import { hasRole } from "../../../data/appRoles";

export default function UserControl() {
  const user = useSelector((state: any) => state.core.user);
  const found = hasRole(user, roleAdmin.roleEdit);
  const tabs: any[] = [
    {
      name: "Users",
      component: <Users />,
    },
  ];

  if (found) {
    tabs.push({
      name: "Manage Roles",
      component: <UserRoles />,
    });
  }

  return (
    <Layout>
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
