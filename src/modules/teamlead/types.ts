export interface ICreateDayDto {    
    startDate: Date;
    endDate: Date;
    taskInfo: string;
    userId: number;

}

export interface ISaveToATT {
    appointmentId: number;
    taskId: number;

}

