import React from 'react';

const ReportSubmissionDetail = ({ submission }: { submission: any }) => {
  // Render the submission detail
  return (
    <div>
      <h2>Report Submission Detail</h2>
      <p>Submission ID: {submission.id}</p>
      <p>Submission Data: {JSON.stringify(submission.data)}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default ReportSubmissionDetail;
