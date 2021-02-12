import {IOption} from "../../components/inputs/inputHelpers";

export interface IGroup {
    id: number;
    privacy: GroupPrivacy;
    name: string;
    details?: string;
    category?: any;
    categoryId: string;
    parent?: any;
    parentId?: number;
    metaData?:       any;
    freeForm?:       string;
    latitude?:       number;
    longitude?:      number;
    geoCoordinates?: string;
    placeId?:        string;
    leaders?:        number[];
}

export interface IGroupMembership {
    id: number;
    group: IOption,
    groupId: number,
    contact: any,
    contactId: number,
    role: GroupRole
}


export interface ICreateBatchMembership {
    groupId: number,
    members: number[],
    role: GroupRole
}


export enum GroupPrivacy {
    Private = "Private",
    Public = "Public"
}

export enum GroupRole {
    Member = 'Member',
    Leader = "Leader"
}


export interface IStats {
    isComplete: boolean
    percentage: number
    childCount: number
}
