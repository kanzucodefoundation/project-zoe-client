import React from 'react';
import { useSelector } from 'react-redux';
import Users from '../admin/users/Users';
import Roles from '../admin/users/Roles';
import Layout from '../../components/layout/Layout';
import TabbedView from '../groups/TabbedView';
import { appPermissions } from '../../data/constants';
import { hasRole } from '../../data/appRoles';
import ReviewSalvationsTable from './ReviewSalvationsTable';

export default function ReviewSalvations() {
  const user = useSelector((state: any) => state.core.user);
  const found = hasRole(user, appPermissions.roleEdit);
  const tabs: any[] = [
    {
      name: 'Salvations',
      component: <ReviewSalvationsTable />,
    },
  ];

  return (
    <Layout>
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
