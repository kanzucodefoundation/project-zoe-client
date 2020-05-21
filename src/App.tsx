import React from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom'
import {ToastContainer} from "react-toastify";
import ContentSwitch from "./modules/ContentSwitch";
import Login from "./modules/login/Login";
import Splash from "./modules/login/Splash";
import {useSelector} from 'react-redux'
import LoaderDialog from "./components/LoaderDialog";
import {localRoutes} from "./data/constants";
import Dashboard from "./modules/dashboard/Dashboard";
import Register from "./modules/login/Register";

const App: React.FC = () => {
    const coreState: any = useSelector((state: any) => state.core)
    const {isLoadingUser, user, globalLoader} = coreState
    if (isLoadingUser) {
        return <Splash/>
    } else {
        return <Router>
            <ToastContainer/>
            <>
                <LoaderDialog open={globalLoader}/>
                {user ?
                    <ContentSwitch/> :
                    <Switch>
                        <Route exact path="/" component={Register}/>
                        <Route path={localRoutes.login} component={Login}/>
                    </Switch>
                }
            </>
        </Router>;
    }
}

export default App;
