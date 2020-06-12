export interface ICreateDayDto {    
    startDate: Date;
    endDate: Date;
    taskInfo: string;
    

}

export interface ISaveToATT {
    appointmentId: number;
    taskId: number;

}

export interface ISaveToUTT {
    appointmentTaskId: number;
    userId: number;

}