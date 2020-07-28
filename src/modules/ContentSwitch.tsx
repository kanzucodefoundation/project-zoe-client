import React from "react"
import {Link, Route, Switch} from 'react-router-dom'
import {localRoutes} from "../data/constants";
import Dashboard from "./dashboard/Dashboard";
import ViewVolunteers from "./volunteers/ViewVolunteers";
import AddVolunteers from "./volunteers/AddVolunteers";
import Contacts from "./contacts/Contacts";
import ContactDetails from "./contacts/details/Details";
import Settings from "./settings/Settings";
import Layout from "../components/layout/Layout";
import Groups from "./groups/GroupsList";
import Users from "./admin/users/Users";
import UserGroups from "./admin/usergroups/UserGroups";
import ViewTasks from "./tasks/ViewTasks";
import AddTasks from "./tasks/AddTasks";
import teamleadcalendar from "./teamlead/TeamLeadCalendar";
import assignedtasks from "./teamlead/AssignedTasks";
import assigntask from "./teamlead/AssignTask";
import volcalendar from "./volcalendar/VolCalendar";
import BlockedDate from "./volcalendar/BlockedDates";
const ContentSwitch = () => {
    return (
      <Switch>
        <Route exact={true} path="/" component={Dashboard} />
        <Route path={localRoutes.dashboard} component={Dashboard} />
        <Route path={localRoutes.contactsDetails} component={ContactDetails} />
        <Route path={localRoutes.contacts} component={Contacts} />
        <Route path={localRoutes.users} component={Users} />
        <Route path={localRoutes.usersGroups} component={UserGroups} />
        <Route path={localRoutes.groups} component={Groups} />
        <Route path={localRoutes.settings} component={Settings} />
                
        <Route path={localRoutes.viewVolunteers} component={ViewVolunteers}/>
        <Route path={localRoutes.addVolunteers} component={AddVolunteers}/>
               
        <Route path={localRoutes.teamleadcalendar} component={teamleadcalendar} />
        <Route path={localRoutes.viewVolunteers} component={ViewVolunteers} />
        <Route path={localRoutes.addVolunteers} component={AddVolunteers} />
        <Route path={localRoutes.volcalendar} component={volcalendar} />
        <Route path={localRoutes.volblockedDate} component={BlockedDate} />
        {/* <Route path={localRoutes.volcalendar} component={volcalendar}/>
        <Route path={localRoutes.voldashboard} component={VolDashboard}/>
        <Route path={localRoutes.volblockdate} component={VolBlockDate}/>
        <Route path={localRoutes.volviewteam} component={VolViewTeam}/> */}
        <Route path={localRoutes.addTasks} component={AddTasks} />
        <Route path={localRoutes.viewTasks} component={ViewTasks} />
        <Route path={localRoutes.assignedtasks} component={assignedtasks} />
        <Route component={NoMatch}/>
      </Switch>
    )
}

const NoMatch = () => (
    <Layout>
        <h2>Oops nothing here!!</h2>
        <Link to="/">Take me home</Link>
    </Layout>
)

export default ContentSwitch