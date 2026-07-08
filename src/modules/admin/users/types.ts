export interface User {
  id: string;
  username: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
  fullName?: string;
  contactId: number;
}

export interface ContactOption {
  id: number;
  name: string;
  avatar?: string | null;
}

export interface RoleDto {
  id: number;
  role: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

export interface AuthUserWithPermissions {
  permissions?: string[];
}

export interface CreateUserData {
  contact: ContactOption | null;
  username: string;
  password: string;
  roles: string[];
  isActive: boolean;
}

export interface EditUserData {
  password: string;
  roles: string[];
  isActive: boolean;
}

export interface RoleFormData {
  id?: number;
  role: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}
