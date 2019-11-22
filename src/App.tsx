import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {ToastContainer} from "react-toastify";
import ContentSwitch from "./modules/ContentSwitch";
import Login from "./modules/login/Login";
import Splash from "./modules/login/Splash";
import {useSelector} from 'react-redux'
import LoaderDialog from "./components/LoaderDialog";

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
                        <Route exact component={Login}/>
                    </Switch>
                }
            </>
        </Router>;
    }
}

export default App;
