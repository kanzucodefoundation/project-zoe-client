export const AUTH_TOKEN_KEY = '__demo__eva__token'
export const AUTH_USER_KEY = '__demo__eva__user'


export const appRoles = {
    roleDashboard: "DASHBOARD",
    roleCrmView: "CRM_VIEW",
    roleCrmEdit: "CRM_EDIT",

    roleUserView: "USER_VIEW",
    roleUserEdit: "USER_EDIT",

    roleTagView: "TAG_VIEW",
    roleTagEdit: "TAG_EDIT",

    roleGroupView: "GROUP_VIEW",
    roleGroupEdit: "GROUP_EDIT",
}

export const rolesList = Object.values(appRoles)

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

    users: '/admin/users',
    usersGroups: '/admin/user-groups',
    tags: '/admin/tags',
    settings: '/admin/settings',
    test: '/test',

    updatePassword: '/update-password',
    resetPassword: '/reset-password',
    forgotPassword: '/forgot-password',
    help: '/help',
    login: '/login',
    home: '/'
}


export const isDebug = process.env.NODE_ENV !== 'production';
const debug = process.env.NODE_ENV !== 'production'
export const url = debug ? 'http://localhost:4002' :
    'https://www.hgjyuk.com/server'

export const remoteRoutes = {
    authServer: url,
    login: url + '/api/auth/login',
    profile: url + '/api/auth/profile',
    register: url + '/api/register',
    forgotPassword: url + '/api/auth/forgot-password',
    resetPassword: url + '/api/auth/reset-password',
    contacts: url + '/api/crm/contacts',
    contactSearch: url + '/api/crm/contact/search',
    contactById: url + '/api/crm/contacts/id',
    contactsPeople: url + '/api/crm/people',
    contactsPeopleCombo: url + '/api/crm/people/combo',
    contactsChc: url + '/api/crm/person/chc',
    contactsEmail: url + '/api/crm/emails',
    tags: url + '/api/tags',
    users: url + '/api/users',
    userGroups: url + '/api/user-groups',
    contactsPhone: url + '/api/crm/phones',
    contactsAddress: url + '/api/crm/addresses',
    contactsIdentification: url + '/api/crm/identifications',
    contactsRequests: url + '/api/crm/requests',

    groups: url + '/api/groups/group',
    groupsCombo: url + '/api/groups/combo',
    groupsCategories: url + '/api/groups/category',
    groupsMembership: url + '/api/groups/member',

    contactsCompany: url + '/api/crm/contact/company',
    contactsAvatar: url + '/api/crm/contact/avatar',

}



