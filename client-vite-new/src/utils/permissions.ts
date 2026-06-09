import { appPermissions } from '../data/constants';

type UserWithCapabilities =
  | {
      permissions?: string[] | null;
      roles?: string[] | null;
    }
  | null
  | undefined;

export const getUserCapabilities = (user: UserWithCapabilities) => {
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return new Set([...permissions, ...roles]);
};

export const hasAnyCapability = (
  user: UserWithCapabilities,
  requiredCapabilities?: string[],
) => {
  if (!requiredCapabilities || requiredCapabilities.length === 0) {
    return true;
  }

  const userCapabilities = getUserCapabilities(user);

  return requiredCapabilities.some((capability) =>
    userCapabilities.has(capability),
  );
};

export const taskViewCapabilities = [
  appPermissions.roleTaskView,
  appPermissions.roleTaskEdit,
];

export const taskEditCapabilities = [appPermissions.roleTaskEdit];

export const attendanceViewCapabilities = [
  appPermissions.roleAttendanceView,
  appPermissions.roleAttendanceEdit,
];

export const attendanceEditCapabilities = [appPermissions.roleAttendanceEdit];

export const canViewTasks = (user: UserWithCapabilities) =>
  hasAnyCapability(user, taskViewCapabilities);

export const canEditTasks = (user: UserWithCapabilities) =>
  hasAnyCapability(user, taskEditCapabilities);

export const canViewAttendance = (user: UserWithCapabilities) =>
  hasAnyCapability(user, attendanceViewCapabilities);

export const canEditAttendance = (user: UserWithCapabilities) =>
  hasAnyCapability(user, attendanceEditCapabilities);
