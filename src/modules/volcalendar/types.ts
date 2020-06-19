export interface ICreateABlockDateDto {
    username: string;
    password: string;
    contactId: number;
    roles: [string];
    taskInfo: string;
    startDate: Date;
    endDate: Date;
}

// export interface ICreateAMembershipDto {
//     groupId: number;
//     contactId: number;
//     role: string;
// }