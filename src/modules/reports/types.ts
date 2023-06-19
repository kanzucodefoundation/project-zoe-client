export interface IReportColumn {
  name: string,
  label: string
}

export interface IReportMetadata {
  name?: string,
  columns: Array<IReportColumn> | []
}

export interface IReport {
  metadata: IReportMetadata,
  data: any[],
  footer: string[],
  columns:  Array<IReportColumn> | []
}

export interface IReportsFilter {
  query?: string;
  skip?: number;
  limit?: number;
}

export interface ReportProps {
  reportName: string,
}
