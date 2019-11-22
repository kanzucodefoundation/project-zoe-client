import React from "react"
import {Link, Route, Switch} from 'react-router-dom'
import {localRoutes} from "../data/constants";
import Dashboard from "./dashboard/Dashboard";
import Contacts from "./contacts/Contacts";
import ContactDetails from "./contacts/details/Details";
import Settings from "./settings/Settings";
import Layout from "../components/layout/Layout";
import CallbackPage from "./login/CallbackPage";
import Groups from "./groups/Groups";
import Users from "./users/Users";
import Tags from "./tags/Tags";


const ContentSwitch = () => {
    return <Switch>
        <Route exact={true} path="/" component={Contacts}/>
        <Route path={localRoutes.dashboard} component={Dashboard}/>
        <Route path={localRoutes.contactsDetails} component={ContactDetails}/>
        <Route path={localRoutes.contacts} component={Contacts}/>
        <Route path={localRoutes.users} component={Users}/>
        <Route path={localRoutes.tags} component={Tags}/>
        <Route path={localRoutes.groups} component={Groups}/>
        <Route path={localRoutes.settings} component={Settings}/>
        <Route path={localRoutes.callback} component={CallbackPage}/>
        <Route component={NoMatch}/>
    </Switch>
}

const NoMatch = () => (
    <Layout>
        <h2>Oops nothing here!!</h2>
        <Link to="/">Take me home</Link>
    </Layout>
)

export default ContentSwitch
