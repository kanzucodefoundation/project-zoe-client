export interface BaseModel {
  id: string;
  createdAt: Date;
  lastUpdated?: Date;
  isDeleted: boolean;
}

export interface IAuthUser {
  id: string;
  contactId: string;
  avatar: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export interface ILoginResponse {
  token: string;
  user: IAuthUser;
}

export interface IState {
  core: ICoreState;
  contacts: any;
}

export interface ICoreState {
  user: IAuthUser;
  token: string;
}

export interface ISearch {
  limit: number;
  skip: number;
  query?: string;
}
