import { GroupCategoryPurpose } from '../groups/types';
import type { Task } from '../../utils/types';

interface CategoryRef {
  id?: number | string;
  name?: string | null;
  purpose?: string | null;
}

interface UserGroupRef {
  id?: number | string;
  groupId?: number | string;
  name?: string | null;
  isActive?: boolean;
  category?: CategoryRef | null;
  groupCategory?: CategoryRef | string | null;
  categoryName?: string | null;
  categoryPurpose?: string | null;
  groupCategoryPurpose?: string | null;
  group?: UserGroupRef | null;
}

export interface TaskListResponse {
  data: Task[];
  total: number;
  groups?: Array<{
    locationGroup?: Task['locationGroup'];
    tasks?: Task[];
  }>;
}

const normalizeText = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, '_') ?? '';

const toNumber = (value?: number | string | null) => {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
};

const getCategory = (group: UserGroupRef) =>
  group.group?.category ??
  group.category ??
  group.group?.groupCategory ??
  group.groupCategory;

const getCategoryName = (group: UserGroupRef) => {
  const category = getCategory(group);
  if (typeof category === 'string') {
    return category;
  }

  return (
    category?.name ?? group.group?.categoryName ?? group.categoryName ?? null
  );
};

const getCategoryPurpose = (group: UserGroupRef) => {
  const category = getCategory(group);
  if (typeof category === 'string') {
    return null;
  }

  return (
    category?.purpose ??
    group.group?.groupCategoryPurpose ??
    group.groupCategoryPurpose ??
    group.group?.categoryPurpose ??
    group.categoryPurpose ??
    null
  );
};

const getLocationGroupId = (group: UserGroupRef) => {
  if (group.isActive === false) {
    return null;
  }

  const purpose = normalizeText(getCategoryPurpose(group));
  const categoryName = normalizeText(getCategoryName(group));
  const isLocationGroup =
    purpose === GroupCategoryPurpose.LOCATION ||
    categoryName === GroupCategoryPurpose.LOCATION;

  if (!isLocationGroup) {
    return null;
  }

  return toNumber(group.groupId ?? group.group?.id ?? group.id);
};

export const getLocationGroupIdsFromResponse = (response: unknown) => {
  const payload = response as { data?: unknown };
  const groups = Array.isArray(response)
    ? response
    : Array.isArray(payload.data)
    ? payload.data
    : [];

  const locationIds = (groups as UserGroupRef[])
    .map(getLocationGroupId)
    .filter((id): id is number => id !== null);

  return Array.from(new Set(locationIds));
};

export const hasLocationScope = (locationGroupIds?: number[]) =>
  Boolean(locationGroupIds?.length);

export const isTaskInLocationScope = (
  task: Task,
  locationGroupIds: ReadonlySet<number>,
) => {
  const locationGroupId = toNumber(task.locationGroup?.id);
  return locationGroupId !== null && locationGroupIds.has(locationGroupId);
};

export const scopeTaskListToLocations = (
  response: TaskListResponse | undefined,
  locationGroupIds?: number[],
): TaskListResponse | undefined => {
  if (!response) {
    return undefined;
  }

  if (!hasLocationScope(locationGroupIds)) {
    return { ...response, data: [], total: 0, groups: [] };
  }

  const locationGroupIdSet = new Set(locationGroupIds);
  const scopedTasks = response.data.filter((task) =>
    isTaskInLocationScope(task, locationGroupIdSet),
  );
  const isLocationGroupInScope = (locationGroup?: Task['locationGroup']) => {
    const locationGroupId = toNumber(locationGroup?.id);
    return locationGroupId !== null && locationGroupIdSet.has(locationGroupId);
  };
  const backendAlreadyScoped = scopedTasks.length === response.data.length;

  return {
    ...response,
    data: scopedTasks,
    total: backendAlreadyScoped ? response.total : scopedTasks.length,
    groups: response.groups
      ?.map((group) => ({
        ...group,
        tasks:
          group.tasks?.filter((task) =>
            isTaskInLocationScope(task, locationGroupIdSet),
          ) ?? [],
      }))
      .filter(
        (group) =>
          isLocationGroupInScope(group.locationGroup) &&
          (group.tasks?.length ?? 0) > 0,
      ),
  };
};

export const scopeTasksToLocations = (
  tasks: Task[] | undefined,
  locationGroupIds?: number[],
) =>
  scopeTaskListToLocations(
    { data: tasks ?? [], total: tasks?.length ?? 0 },
    locationGroupIds,
  )?.data ?? [];
