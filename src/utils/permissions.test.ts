import { describe, it, expect } from 'vitest';
import {
  getUserCapabilities,
  hasAnyCapability,
  canViewTasks,
  canEditTasks,
  canViewAttendance,
  canEditAttendance,
} from './permissions';

const TASK_VIEW = 'TASK_VIEW';
const TASK_EDIT = 'TASK_EDIT';
const ATTENDANCE_VIEW = 'ATTENDANCE_VIEW';
const ATTENDANCE_EDIT = 'ATTENDANCE_EDIT';

describe('getUserCapabilities', () => {
  it('returns empty set for null user', () => {
    expect(getUserCapabilities(null).size).toBe(0);
  });

  it('returns empty set for undefined user', () => {
    expect(getUserCapabilities(undefined).size).toBe(0);
  });

  it('includes permissions from user.permissions array', () => {
    const caps = getUserCapabilities({ permissions: ['CRM_VIEW', 'CRM_EDIT'] });
    expect(caps.has('CRM_VIEW')).toBe(true);
    expect(caps.has('CRM_EDIT')).toBe(true);
  });

  it('includes roles from user.roles array', () => {
    const caps = getUserCapabilities({ roles: ['RoleAdmin'] });
    expect(caps.has('RoleAdmin')).toBe(true);
  });

  it('merges permissions and roles into one set', () => {
    const caps = getUserCapabilities({
      permissions: ['CRM_VIEW'],
      roles: ['RoleAdmin'],
    });
    expect(caps.has('CRM_VIEW')).toBe(true);
    expect(caps.has('RoleAdmin')).toBe(true);
  });

  it('handles null permissions gracefully', () => {
    const caps = getUserCapabilities({ permissions: null, roles: ['RoleAdmin'] });
    expect(caps.has('RoleAdmin')).toBe(true);
  });

  it('handles null roles gracefully', () => {
    const caps = getUserCapabilities({ permissions: ['CRM_VIEW'], roles: null });
    expect(caps.has('CRM_VIEW')).toBe(true);
  });
});

describe('hasAnyCapability', () => {
  it('returns true when no required capabilities are specified', () => {
    expect(hasAnyCapability(null, [])).toBe(true);
    expect(hasAnyCapability(null, undefined)).toBe(true);
  });

  it('returns true when user has at least one of the required capabilities', () => {
    const user = { permissions: [TASK_VIEW] };
    expect(hasAnyCapability(user, [TASK_VIEW, TASK_EDIT])).toBe(true);
  });

  it('returns false when user has none of the required capabilities', () => {
    const user = { permissions: ['CRM_VIEW'] };
    expect(hasAnyCapability(user, [TASK_VIEW, TASK_EDIT])).toBe(false);
  });

  it('returns false for null user with required capabilities', () => {
    expect(hasAnyCapability(null, [TASK_VIEW])).toBe(false);
  });

  it('checks roles as well as permissions', () => {
    const user = { roles: [TASK_EDIT] };
    expect(hasAnyCapability(user, [TASK_EDIT])).toBe(true);
  });
});

describe('canViewTasks', () => {
  it('returns true for user with TASK_VIEW permission', () => {
    expect(canViewTasks({ permissions: [TASK_VIEW] })).toBe(true);
  });

  it('returns true for user with TASK_EDIT permission (edit implies view)', () => {
    expect(canViewTasks({ permissions: [TASK_EDIT] })).toBe(true);
  });

  it('returns false for user with unrelated permissions', () => {
    expect(canViewTasks({ permissions: ['CRM_VIEW'] })).toBe(false);
  });

  it('returns false for null user', () => {
    expect(canViewTasks(null)).toBe(false);
  });
});

describe('canEditTasks', () => {
  it('returns true for user with TASK_EDIT permission', () => {
    expect(canEditTasks({ permissions: [TASK_EDIT] })).toBe(true);
  });

  it('returns false for user with only TASK_VIEW permission', () => {
    expect(canEditTasks({ permissions: [TASK_VIEW] })).toBe(false);
  });

  it('returns false for null user', () => {
    expect(canEditTasks(null)).toBe(false);
  });
});

describe('canViewAttendance', () => {
  it('returns true for user with ATTENDANCE_VIEW', () => {
    expect(canViewAttendance({ permissions: [ATTENDANCE_VIEW] })).toBe(true);
  });

  it('returns true for user with ATTENDANCE_EDIT (edit implies view)', () => {
    expect(canViewAttendance({ permissions: [ATTENDANCE_EDIT] })).toBe(true);
  });

  it('returns false for user without attendance permissions', () => {
    expect(canViewAttendance({ permissions: [TASK_VIEW] })).toBe(false);
  });
});

describe('canEditAttendance', () => {
  it('returns true for user with ATTENDANCE_EDIT', () => {
    expect(canEditAttendance({ permissions: [ATTENDANCE_EDIT] })).toBe(true);
  });

  it('returns false for user with only ATTENDANCE_VIEW', () => {
    expect(canEditAttendance({ permissions: [ATTENDANCE_VIEW] })).toBe(false);
  });

  it('returns false for null user', () => {
    expect(canEditAttendance(null)).toBe(false);
  });
});

// ─── role-based paths ─────────────────────────────────────────────────────────
// The can* helpers call getUserCapabilities which merges permissions AND roles.
// Verify the role path is honoured (not just the permission path).

describe('can* helpers via roles (not permissions)', () => {
  it('canViewTasks is true when TASK_VIEW is in roles', () => {
    expect(canViewTasks({ roles: [TASK_VIEW] })).toBe(true);
  });

  it('canEditTasks is true when TASK_EDIT is in roles', () => {
    expect(canEditTasks({ roles: [TASK_EDIT] })).toBe(true);
  });

  it('canViewAttendance is true when ATTENDANCE_EDIT is in roles', () => {
    expect(canViewAttendance({ roles: [ATTENDANCE_EDIT] })).toBe(true);
  });

  it('canEditAttendance is true when ATTENDANCE_EDIT is in roles', () => {
    expect(canEditAttendance({ roles: [ATTENDANCE_EDIT] })).toBe(true);
  });

  it('capability granted by role is not blocked when permissions array is empty', () => {
    expect(canEditTasks({ permissions: [], roles: [TASK_EDIT] })).toBe(true);
  });

  it('capability from permissions is not blocked when roles array is empty', () => {
    expect(canEditTasks({ permissions: [TASK_EDIT], roles: [] })).toBe(true);
  });
});
