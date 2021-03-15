export interface IReport {
    id: string;
    privacy: string;
    name: string;
    date: Date;
    submittedAt: Date;
    submittedBy: string;
    details: string;
    venue?: any;
    categoryId: string;
    category: any;
    groupId: number;
    group: any;
    attendance: IAttendance[];
    leaders: any[];
    metaData?: MetaData;
  }

 export interface IAttendance {
    id: number;
    isVisitor: boolean;
    reportId: string;
    contactId: number;
  }

  export interface MetaData {}

