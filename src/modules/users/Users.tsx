import React, {Fragment} from 'react';
import Layout from "../../components/layout/Layout";


import {useTheme} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {XHeadCell} from "../../components/table/XTableHead";
import {Avatar} from "@material-ui/core";
import {fakeUser} from "./types";
import {IUser} from "../../data/types";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Box from "@material-ui/core/Box";
import Header from "../contacts/Header";
import DataList from "../../components/DataList";
import AddIcon from "@material-ui/core/SvgIcon/SvgIcon";
import Fab from "@material-ui/core/Fab";
import {AddFabButton} from "../../components/EditIconButton";


interface IProps {
}

const columns: XHeadCell[] = [
    {
        name: 'avatar',
        label: 'Avatar',
        render: (data) => {
            return <Avatar src={data}/>
        },
        cellProps: {
            width: 50
        }
    },
    {
        name: 'fullName',
        label: 'Full Name',
        cellProps: {
            component: "th", scope: "row"
        }
    },
    {
        name: 'username',
        label: 'Username'
    },

    {
        name: 'email',
        label: 'email'
    }
]

interface IMobileRow {
    avatar: any
    primary: any
    secondary: any
}

const toMobile = (data: any): IMobileRow => {
    return {
        avatar: <Avatar src={data.avatar}/>,
        primary: data.fullName,
        secondary: <>
            <Typography variant='caption' color='textSecondary' display='block'>{data.email}</Typography>
            <Typography variant='caption' color='textSecondary'>{data.username}</Typography>
        </>,
    }
}


const data: IUser[] = []
for (let i = 0; i < 10; i++) {
    data.push(fakeUser())
}

const Users = (props: IProps) => {
    function handleFilterToggle() {

    }

    function handleNew() {

    }

    return (
        <Layout>
            <Box p={2}>
                <Header onAddNew={handleNew} onFilterToggle={handleFilterToggle}/>
                <DataList data={data} toMobileRow={toMobile} columns={columns}/>
            </Box>
            <AddFabButton onClick={handleNew}/>
        </Layout>
    );
}

export default Users;
