import React from "react";
import {connect} from "react-redux";
import {CallbackComponent} from "redux-oidc";
import {withRouter} from "react-router";
import userManager from "../../data/auth/userManager";

function CallbackPage(props: any) {
    console.log("Rendering callback")
    const {history} = props;
    return (
        <CallbackComponent
            userManager={userManager}
            successCallback={(data) => {
                console.log("Successful login", data);
                history.push("/")
            }}
            errorCallback={error => {
                history.push("/")
                console.error(error);
            }}
        >
            <div>Redirecting...</div>
        </CallbackComponent>
    );
}

const Connected: any = connect()(CallbackPage);
export default withRouter(Connected);
