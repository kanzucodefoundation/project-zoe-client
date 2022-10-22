import React from 'react';
import TabbedView from '../groups/TabbedView';
import Layout from '../../components/layout/Layout';
import UnsubmittedReports from '../events/UnsubmittedReports';
import ServiceAttendanceReport from './ServiceAttendanceReport';

export default function ReportList() {
  const tabs = [
    {
      name: 'Service Attendance',
      component: <ServiceAttendanceReport reportName='service-attendance' />,
    },
    {
      name: 'Small Group Attendance',
      component: <ServiceAttendanceReport reportName='small-group-attendance'/>,
    },
  ];

  return (
    <Layout>
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
