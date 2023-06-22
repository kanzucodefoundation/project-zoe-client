import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TabbedView from '../groups/TabbedView';
import Layout from '../../components/layout/Layout';
import ReportSubmissions from './ReportSubmissions';
import ListHeader from '../../components/ListHeader';
import ReportFilter from './ReportFilter';
import { ICrmState } from '../../data/contacts/reducer';
import { IReportsFilter } from './types';

export default function ReportSubmissionsList() {
  const { data, loading }: ICrmState = useSelector((state: any) => state.crm);
  const [filter, setFilter] = useState<IReportsFilter>({
    limit: 200,
  });
  const tabs = [
    {
      name: 'Service Attendance',
      component: <ReportSubmissions report={{id: 1, name: 'service-attendance'}} onBackToList={() => {}} />,
    },
    {
      name: 'Small Group Attendance',
      component: <ReportSubmissions report={{id: 1, name: 'service-attendance'}} onBackToList={() => {}} />,
    },
    {
      name: 'Salvations',
      component: <ReportSubmissions report={{id: 1, name: 'service-attendance'}} onBackToList={() => {}} />,
    },
  ];

  return (
    <Layout>
      <ListHeader
          title="Report Submissions"
          onFilter={setFilter}
          filter={filter}
          filterComponent={<ReportFilter onFilter={setFilter} />}
          loading={loading}
        />
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
