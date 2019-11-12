import {createUserManager} from 'redux-oidc';
import {remoteRoutes} from "../constants";
import {WebStorageStateStore} from "oidc-client";

const config = {
    client_id: 'dfcu:backoffice',
    redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/callback`,
    post_logout_redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`,
    response_type: 'token id_token',
    scope: 'openid profile offline_access roles agent_details Crm CaseHandling KycConnector',
    authority: remoteRoutes.authServer,
    silent_redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/silent_renew.html`,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({store: window.localStorage})
};

console.log("Config", config)
const userManager = createUserManager(config);

export default userManager;
