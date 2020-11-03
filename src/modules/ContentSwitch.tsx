import React from "react"
import {Link, Route, Switch} from 'react-router-dom'
import {appRoles, localRoutes} from "../data/constants";
import Dashboard from "./dashboard/Dashboard";
import Contacts from "./contacts/Contacts";
import ContactDetails from "./contacts/details/Details";
import Settings from "./settings/Settings";
import Layout from "../components/layout/Layout";
import Groups from "./groups/GroupTabView";
import GroupDetails from "./groups/Details";
import Users from "./admin/users/Users";
import {useSelector} from "react-redux";
import {IState} from "../data/types";
import MembersEditor from "./groups/members/MembersEditor";
import {hasAnyRole} from "../data/appRoles";



const ContentSwitch = () => {
    const user = useSelector((state: IState) => state.core.user)


    return <Switch>
        <Route exact={true} path="/" component={Dashboard}/>
        <Route path={localRoutes.dashboard} component={Dashboard}/>
        {
            hasAnyRole(user,[appRoles.roleCrmEdit,"CRM_EDIT"]) &&
            <Route path={localRoutes.contactsDetails} component={ContactDetails}/>
        }
        <Route path={localRoutes.contactsDetails} component={ContactDetails}/>
        <Route path={localRoutes.contacts} component={Contacts}/>
        <Route path={localRoutes.users} component={Users}/>
        <Route path={localRoutes.groupsDetails} component={GroupDetails}/>
        <Route path={localRoutes.groups} component={Groups}/>
        <Route path={localRoutes.settings} component={Settings}/>
        <Route path={localRoutes.test} component={Testing}/>
        <Route component={NoMatch}/>
    </Switch>
}

const Testing = () => (
    <Layout>
        <MembersEditor group={{id: 1}} done={() => undefined}/>
    </Layout>
)

const NoMatch = () => (
    <Layout>
        <h2>Oops nothing here!!</h2>
        <Link to="/">Take me home</Link>
    </Layout>
)

export default ContentSwitch
