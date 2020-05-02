import React from "react";
import PersonIcon from "@material-ui/icons/Person";
import {hasValue} from "./inputs/inputHelpers";
import {Avatar} from "@material-ui/core";

interface IProps {
    data: any
}

const XAvatar = ({data}: IProps) => {
    return hasValue(data.avatar) ?
        <Avatar
            alt="Avatar"
            src={data.avatar}
        /> :
        <Avatar>
            <PersonIcon/>
        </Avatar>
        ;
}

export default XAvatar;
