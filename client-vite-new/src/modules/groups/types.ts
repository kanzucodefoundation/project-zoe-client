export const GroupPrivacy = {
  Private: 'Private',
  Public: 'Public',
} as const;
export type GroupPrivacy = typeof GroupPrivacy[keyof typeof GroupPrivacy];

export interface IGroupCategory {
  id: number;
  name: string;
}

export interface IAddress {
  placeId?: string;
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface GroupNode {
  id: number;
  privacy: string;
  name: string;
  details: string | null;
  metaData: string | null;
  parentId: number | null;
  address?: IAddress | null;
  categoryId?: number;
  category?: IGroupCategory | null;
  parent?: Pick<IGroup, 'id' | 'name'> | null;
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
  metaData?: unknown;
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
