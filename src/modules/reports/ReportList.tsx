import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TabbedView from '../groups/TabbedView';
import Layout from '../../components/layout/Layout';
import ServiceAttendanceReport from './ServiceAttendanceReport';
import ListHeader from '../../components/ListHeader';
import ReportFilter from './ReportFilter';
import { ICrmState } from '../../data/contacts/reducer';
import { IReportsFilter } from './types';

export default function ReportList() {
  const { data, loading }: ICrmState = useSelector((state: any) => state.crm);
  const [filter, setFilter] = useState<IReportsFilter>({
    limit: 200,
  });
  const tabs = [
    {
      name: 'Service Attendance',
      component: <ServiceAttendanceReport reportName='service-attendance' />,
    },
    {
      name: 'Small Group Attendance',
      component: <ServiceAttendanceReport reportName='small-group-attendance'/>,
    },
    {
      name: 'Salvations',
      component: <ServiceAttendanceReport reportName='salvations'/>,
    },
  ];

  return (
    <Layout>
      <ListHeader
          title="Summary Reports"
          onFilter={setFilter}
          filter={filter}
          filterComponent={<ReportFilter onFilter={setFilter} />}
          loading={loading}
        />
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
