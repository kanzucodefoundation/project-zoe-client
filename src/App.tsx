import React, {Suspense} from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom'
import {ToastContainer} from "react-toastify";
import Login from "./modules/login/Login";
import Splash from "./modules/login/Splash";
import {useSelector} from 'react-redux'
import LoaderDialog from "./components/LoaderDialog";
import {localRoutes} from "./data/constants";
import Register from "./modules/login/Register";
import Loading from "./components/Loading";

const ContentSwitch = React.lazy(() => import("./modules/ContentSwitch"));
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
                    <Suspense fallback={<Loading/>}>
                        <ContentSwitch/>
                    </Suspense>
                    :
                    <Switch>
                        <Route path={localRoutes.login} component={Login}/>
                        <Route component={Register}/>
                    </Switch>
                }
            </>
        </Router>;
    }
}

export default App;
