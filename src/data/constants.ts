export const AUTH_TOKEN_KEY = '__demo__eva__token'
export const AUTH_USER_KEY = '__demo__eva__user'


export const systemRoles = {
    contacts: {
        view: 'contacts_view',
        edit: 'contacts_edit',
        chc: 'contacts_chc',
        teams: 'contacts_teams',
    }
}


export const redux = {
    doLogin: 'DO_LOGIN',
    doLogout: 'DO_LOGOUT',
    doSearch: 'DO_SEARCH',
};

export const localRoutes = {
    callback: '/callback',
    pending: '/pending',
    applications: '/applications',
    applicationsDetails: '/applications/:caseId',
    dashboard: '/dashboard',
    contacts: '/contacts',
    users: '/users',
    groups: '/groups',
    contactsDetails: '/contacts/:contactId',
    settings: '/settings',
}

const debug = process.env.NODE_ENV !== 'production'
export const url = //debug ? 'http://localhost:9001' :
    'https://event-yo-server.herokuapp.com'

export const remoteRoutes = {
    authServer: url,
    login: url + '/api/auth/login',
    profile: url + '/api/auth/profile',
    register: url + '/api/auth/register',
    resetPass: url + '/reset',
    contacts: url + '/api/crm/contact',
    contactSearch: url + '/api/crm/contact/search',
    contactById: url + '/api/crm/contact/id',
    contactsPerson: url + '/api/crm/person',
    contactsChc: url + '/api/crm/person/chc',
    contactsEmail: url + '/api/crm/email',
    contactsPhone: url + '/api/crm/phone',
    contactsAddress: url + '/api/crm/address',
    contactsIdentification: url + '/api/crm/identification',

    contactsCompany: url + '/api/crm/contact/company',
    contactsAvatar: url + '/api/crm/contact/avatar',
    workflows: url + '/api/workflows',
}



