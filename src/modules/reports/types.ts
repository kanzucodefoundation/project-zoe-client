export interface IReportColumn {
  name: string,
  label: string
}

export interface IReportField{
  name: string,
  label: string,
  type: string,
  options?: IReportFieldOption[],
  required?: boolean
}

export interface IReportFieldOption {
  value: string;
  label: string;
}

export interface IReportMetadata {
  name?: string,
  columns: Array<IReportColumn> | []
}

export interface IReport {
  id: number;
  title?: string;
  name?: string;
  metadata?: IReportMetadata,
  data?: any[],
  footer?: string[],
  columns?: Array<IReportColumn> | []
}

export interface ICreateReportSubmissionDto{
  reportId: string,
  data: any[]
}

export interface IReportsFilter {
  query?: string;
  skip?: number;
  limit?: number;
}

export interface ReportProps {
  report: IReport,
  onBackToList: () => void,
}

export interface ReportSubmissionData{
    id: number;
    data: {
      date: string;
      mcHostHome: string;
      smallGroupId: number;
      mcHuddleCount: string;
      mcTestimonies: string;
      smallGroupName: string;
      mcAttendeeNames: string;
      mcFrontierStory: string;
      mcPrayerRequest: string;
      mcWordHighlights: string;
      mcGeneralFeedback: string;
      smallGroupAttendanceCount: string;
      smallGroupNumberOfMembers: string;
    };
    labels: {
      name: string;
      label: string;
    }[];
    submittedAt: string;
    submittedBy: string;  
};
