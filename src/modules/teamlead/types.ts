export interface ICreateDayDto {
    startDate: Date;
    endDate: Date;
}

export interface ISaveToATT {
    appointmentId: number;
    taskId: number;
}

export interface ISaveToUTT {
    appointmentTaskId: number;
    userId: number;
}