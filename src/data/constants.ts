export const AUTH_TOKEN_KEY = "__demo__eva__token";
export const AUTH_USER_KEY = "__demo__eva__user";

export const appPermissions = {
  roleDashboard: "DASHBOARD",
  roleCrmView: "CRM_VIEW",
  roleCrmEdit: "CRM_EDIT",

  roleUserView: "USER_VIEW",
  roleUserEdit: "USER_EDIT",

  roleEdit: "ROLE_EDIT",

  roleTagView: "TAG_VIEW",
  roleTagEdit: "TAG_EDIT",

  roleGroupView: "GROUP_VIEW",
  roleGroupEdit: "GROUP_EDIT",

  roleEventView: "EVENT_VIEW",
  roleEventEdit: "EVENT_EDIT",
};

export const permissionsList = Object.values(appPermissions);

export const eventsCategories = {
  garage: "garage",
  evangelism: "evangelism",
  wedding: "wedding",
  baptism: "baptism",
  mc: "mc",
};

export const redux = {
  doLogin: "DO_LOGIN",
  doLogout: "DO_LOGOUT",
  doSearch: "DO_SEARCH",
};

export const localRoutes = {
  dashboard: "/dashboard",
  contacts: "/people/contacts",
  profile: "/people/contacts/me",
  contactsDetails: "/people/contacts/:contactId",
  groups: "/people/groups",
  groupsDetails: "/people/groups/:groupId",

  groupsReports: "/groups",

  events: "/events",
  eventsDetails: "/events/:eventId",

  reports: "/reports",
  reportsDetails: "/reports/:reportId",

  users: "/admin/users",
  usersGroups: "/admin/user-groups",
  tags: "/admin/tags",
  settings: "/admin/settings",
  test: "/test",

  updatePassword: "/update-password",
  resetPassword: "/reset-password/:token",
  forgotPassword: "/forgot-password",
  help: "/help",
  login: "/login",
  home: "/",
};

export const isDebug = process.env.NODE_ENV !== "production";
const debug = process.env.NODE_ENV !== "production";
export const url = debug
  ? "http://localhost:4002"
  : "https://app.worshipharvest.org/server";

export const remoteRoutes = {
  authServer: url,
  login: url + "/api/auth/login",
  profile: url + "/api/auth/profile",
  register: url + "/api/register",
  forgotPassword: url + "/api/auth/forgot-password",
  resetPassword: url + "/api/auth/reset-password",
  contacts: url + "/api/crm/contacts",
  contactSearch: url + "/api/crm/contact/search",
  contactById: url + "/api/crm/contacts/id",
  contactsPeople: url + "/api/crm/people",
  contactsPeopleCombo: url + "/api/crm/people/combo",

  contactsPeopleSample: url + "/api/crm/import",
  contactsPeopleUpload: url + "/api/crm/import",
  contactsChc: url + "/api/crm/person/chc",
  contactsEmail: url + "/api/crm/emails",
  tags: url + "/api/tags",
  users: url + "/api/users",
  userGroups: url + "/api/user-groups",
  roles: url + "/api/user-roles",
  contactsPhone: url + "/api/crm/phones",
  contactsAddress: url + "/api/crm/addresses",
  contactsIdentification: url + "/api/crm/identifications",
  contactsRequests: url + "/api/crm/requests",

  groups: url + "/api/groups/group",
  groupsCombo: url + "/api/groups/combo",
  groupsCategories: url + "/api/groups/category",
  groupsMembership: url + "/api/groups/member",
  groupsRequest: url + "/api/groups/request",
  groupReports: url + "/api/groups/groupreports",
  groupReportFrequency: url + "/api/groups/reportfrequency",
  groupCategoriesCombo: url + "/api/groups/groupscombo",

  events: url + "/api/events/event",
  eventsMetricsRaw: url + "/api/events/metrics/raw",
  eventsCategories: url + "/api/events/category",
  eventsAttendance: url + "/api/events/attendance",
  eventsField: url + "/api/events/fields",

  reports: url + "/api/reports/report",
  reportsCategories: url + "api/reports/category",

  contactsCompany: url + "/api/crm/contact/company",
  contactsAvatar: url + "/api/crm/contact/avatar",
};
