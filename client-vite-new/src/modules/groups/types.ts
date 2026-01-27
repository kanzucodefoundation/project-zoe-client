export enum GroupPrivacy {
  Private = 'Private',
  Public = 'Public',
}

export interface IGroupCategory {
  id: number;
  name: string;
}

export interface IAddress {
  placeId?: string;
  name?: string;
  description?: string;
}

export interface GroupNode {
  id: number;
  privacy: string;
  name: string;
  details: string | null;
  metaData: string | null;
  parentId: number | null;
  address: string | null;
  categoryId?: number;
  children: GroupNode[];
}

export interface IGroup {
  id: number;
  privacy: GroupPrivacy;
  name: string;
  details?: string;
  category?: IGroupCategory;
  categoryId?: number;
  parent?: IGroup;
  parentId?: number | null;
  metaData?: any;
  address?: IAddress | null;
  children: IGroup[];
}

export interface GroupFormData {
  name: string;
  privacy: GroupPrivacy;
  details: string;
  categoryId: number | null;
  parentId: number | null;
}
