import React, { useEffect, useState } from 'react';
import ReportForm from './ReportFormSubmit';
import { remoteRoutes } from '../../data/constants';

const ReportPage: React.FC = () => {
  const [fields, setFields] = useState<string[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`${remoteRoutes.reports}/6`);
        if (response.ok) {
          const { data } = await response.json();
          const { fields } = data;
          setFields(fields);
        } else {
          console.error('Failed to fetch report');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    fetchReport();
  }, []);

  return (
    <div>
      <h1>Report Submission</h1>
      {fields.length > 0 ? (
        <ReportForm reportId="6" fields={fields} />
      ) : (
        <p>Loading report fields...</p>
      )}
    </div>
  );
};

export default ReportPage;
