import { CivilStatus } from "../contacts/types";

export interface ICreateAVolunteerDto {
    category: string;
    ministry: string;
    firstName: string;
    lastName: string;
    gender: string,
    civilStatus: CivilStatus;
    phone: string,
    email: string;
    password: string;
    dateOfBirth: string;
    missionalCommunity: string;
    profession: string;
}