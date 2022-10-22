export interface IReportColumn{
  name: string,
  label: string
}

export interface IReportMetadata{
  name?: string,
  columns: Array<IReportColumn> | []
}

export interface IReport{
  metadata: IReportMetadata,
  data: any[]
}


