export const AUTH_TOKEN_KEY = '__demo__eva__token';
export const AUTH_USER_KEY = '__demo__eva__user';

export const appPermissions = {
  roleDashboard: 'DASHBOARD',
  roleCrmView: 'CRM_VIEW',
  roleCrmEdit: 'CRM_EDIT',

  roleUserView: 'USER_VIEW',
  roleUserEdit: 'USER_EDIT',

  roleEdit: 'ROLE_EDIT',

  roleTagView: 'TAG_VIEW',
  roleTagEdit: 'TAG_EDIT',

  roleGroupView: 'GROUP_VIEW',
  roleGroupEdit: 'GROUP_EDIT',

  roleSmallGroupView: 'MC_VIEW',

  roleEventView: 'EVENT_VIEW',
  roleEventEdit: 'EVENT_EDIT',

  roleReportView: 'REPORT_VIEW',
  roleReportViewSubmissions: 'REPORT_VIEW_SUBMISSIONS',

  manageHelp: 'MANAGE_HELP',
};

export const permissionsList = Object.values(appPermissions);

export const eventsCategories = {
  garage: 'garage',
  evangelism: 'evangelism',
  wedding: 'wedding',
  baptism: 'baptism',
  mc: 'mc',
};

export const redux = {
  doLogin: 'DO_LOGIN',
  doLogout: 'DO_LOGOUT',
  doSearch: 'DO_SEARCH',
};

export const localRoutes = {

  dashboard: '/dashboard',
  contacts: '/people/contacts',
  profile: '/people/contacts/me',
  contactsDetails: '/people/contacts/:contactId',
  groups: '/people/groups',
  groupsDetails: '/people/groups/:groupId',

  groupsReports: '/groups',

  events: '/events',
  eventsDetails: '/events/:eventId',
  eventActivities: '/events/:activitiesId',

  reports: '/reports',
  reportsDetails: '/reports/:reportId',
  reportSubmit: '/reports/:reportId/submit',
  reportSubmissions: '/reports/:reportId/submissions',
  reportSubmissionDetails: '/reports/:reportId/submissions/:reportSubmissionId',

  users: '/admin/users',
  usersGroups: '/admin/user-groups',
  tags: '/admin/tags',
  settings: '/admin/settings',
  test: '/test',

  updatePassword: '/update-password',
  resetPassword: '/reset-password/:token',
  forgotPassword: '/forgot-password',
  help: '/help',
  login: '/login',
  register: '/register',
  home: '/',
  manageHelp: '/admin/manageHelp',
  chat: '/chat/email',

  calendar: '/calendar',
  reportCategories: '/admin/report-categories',
  groupsCategories: '/admin/group-categories',
  eventCategories: '/admin/event-categories',

};

const isDevelopmentMode = process.env.NODE_ENV !== 'production';
const apiBaseUrl = isDevelopmentMode
  ? 'http://localhost:4002'
  : 'https://projectzoe.kanzucodefoundation.org/server';

export const remoteRoutes = {
  authServer: apiBaseUrl,

  login: `${apiBaseUrl}/api/auth/login`,
  profile: `${apiBaseUrl}/api/auth/profile`,
  register: `${apiBaseUrl}/api/register`,
  forgotPassword: `${apiBaseUrl}/api/auth/forgot-password`,
  resetPassword: `${apiBaseUrl}/api/auth/reset-password`,
  contacts: `${apiBaseUrl}/api/crm/contacts`,
  contactSearch: `${apiBaseUrl}/api/crm/contact/search`,
  contactById: `${apiBaseUrl}/api/crm/contacts/id`,
  contactsPeople: `${apiBaseUrl}/api/crm/people`,
  contactsPeopleCombo: `${apiBaseUrl}/api/crm/people/combo`,

  contactsPeopleSample: `${apiBaseUrl}/api/crm/import`,
  contactsPeopleUpload: `${apiBaseUrl}/api/crm/import`,
  contactsChc: `${apiBaseUrl}/api/crm/person/chc`,
  contactsEmail: `${apiBaseUrl}/api/crm/emails`,
  tags: `${apiBaseUrl}/api/tags`,
  users: `${apiBaseUrl}/api/users`,
  userGroups: `${apiBaseUrl}/api/user-groups`,
  roles: `${apiBaseUrl}/api/user-roles`,
  contactsPhone: `${apiBaseUrl}/api/crm/phones`,
  contactsAddress: `${apiBaseUrl}/api/crm/addresses`,
  contactsIdentification: `${apiBaseUrl}/api/crm/identifications`,
  contactsRequests: `${apiBaseUrl}/api/crm/requests`,

  groups: `${apiBaseUrl}/api/groups/group`,
  groupsCombo: `${apiBaseUrl}/api/groups/combo`,
  groupsCategories: `${apiBaseUrl}/api/groups/category`,
  groupsMembership: `${apiBaseUrl}/api/groups/member`,
  groupsRequest: `${apiBaseUrl}/api/groups/request`,
  groupReports: `${apiBaseUrl}/api/groups/groupreports`,
  groupReportFrequency: `${apiBaseUrl}/api/groups/reportfrequency`,
  groupCategoriesCombo: `${apiBaseUrl}/api/groups/groupscombo`,

  events: `${apiBaseUrl}/api/events/event`,
  eventsMetricsRaw: `${apiBaseUrl}/api/events/metrics/raw`,
  eventsCategories: `${apiBaseUrl}/api/events/category`,
  eventsAttendance: `${apiBaseUrl}/api/events/attendance`,
  eventsField: `${apiBaseUrl}/api/events/fields`,
  eventsActivity: `${apiBaseUrl}/api/events/activities`,
  memberEventActivities: `${apiBaseUrl}/api/events/member`,
  dayOff: `${apiBaseUrl}/api/events/dayoff`,

  reports: `${apiBaseUrl}/api/reports`,
  reportsSubmit: `${apiBaseUrl}/api/reports/submit`,
  reportsCategories: `${apiBaseUrl}api/reports/category`,

  contactsCompany: `${apiBaseUrl}/api/crm/contact/company`,
  contactsAvatar: `${apiBaseUrl}/api/crm/contact/avatar`,
  chat: `${apiBaseUrl}/api/chat/email`,
  eventsRegistration: `${apiBaseUrl}/api/events/registration`,
  help: `${apiBaseUrl}/api/help`,

};
