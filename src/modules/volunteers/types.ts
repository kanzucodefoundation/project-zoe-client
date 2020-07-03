export interface ICreateAVolunteerDto {
    username: string;
    password: string;
    contactId: number;
    roles: [string];
}

export interface ICreateAMembershipDto {
    groupId: number;
    contactId: number;
    role: string;
}

export interface IUpdateAMembershipDto {
    id: number;
    groupId: number;
    contactId: number;
    role: string;
}