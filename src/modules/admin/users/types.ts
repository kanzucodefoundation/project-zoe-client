export interface IUser {
  username: string;
  contact: any;
  avatar: string;
  id?: string;
  roles: string[];
}
export interface IUserDto {
  fullName: string;
  isActive: boolean;
  avatar: string;
  id?: string;
  roles: string[];
}

export interface IRoles {
  id: number;
  role: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}
