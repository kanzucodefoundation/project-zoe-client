export interface IGroup {
    id: number;
    privacy: GroupPrivacy;
    name: string;
    details?: string;
    category?: any;
    categoryId: string;
    parent?: any;
    parentId?: number;
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
