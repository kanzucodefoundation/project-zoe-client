import React from 'react';
import TabbedView from '../groups/TabbedView';
import Layout from '../../components/layout/Layout';
import UnsubmittedReports from '../events/UnsubmittedReports';
import ServiceAttendanceReport from './ServiceAttendanceReport';

export default function ReportList() {
  const tabs = [
    {
      name: 'Service Attendance',
      component: <ServiceAttendanceReport />,
    },
    {
      name: 'Small Group Attendance',
      component: <UnsubmittedReports />,
    },
  ];

  return (
    <Layout>
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
