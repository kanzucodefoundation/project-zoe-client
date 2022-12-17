import React,{useState} from 'react';
import TabbedView from '../groups/TabbedView';
import Layout from '../../components/layout/Layout';
import UnsubmittedReports from '../events/UnsubmittedReports';
import ServiceAttendanceReport from './ServiceAttendanceReport';
import ListHeader from '../../components/ListHeader';
import ReportFilter from './ReportFilter';
import { ICrmState } from '../../data/contacts/reducer';
import {useSelector} from 'react-redux'
import { IReportsFilter } from './types';

export default function ReportList() {
  const { data, loading }: ICrmState = useSelector((state: any) => state.crm);
  const [filter, setFilter] = useState<IReportsFilter>({
    limit: 200,
  });
  const [reportName,setReportName] = useState("")

  function updateReport(newValue:string){
      setReportName(newValue)
  }
  
  const tabs = [
    {
      name: 'Service Attendance',
      component: <ServiceAttendanceReport reportName='service-attendance' updateReportName={updateReport}/>,
    },
    {
      name: 'Small Group Attendance',
      component: <ServiceAttendanceReport reportName='small-group-attendance' updateReportName={updateReport}/>,
    },
    {
      name: 'Salvations',
      component: <ServiceAttendanceReport reportName='salvations' updateReportName={updateReport}/>,
    },
  ];

  return (
    <Layout>
      <ListHeader
          title="Summary Reports"
          onFilter={setFilter}
          filter={filter}
          filterComponent={<ReportFilter onFilter={setFilter} reportName={reportName}/>}
          loading={loading}
        />
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
