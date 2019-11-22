import React from 'react';
import Layout from "../../components/layout/Layout";
import {XHeadCell} from "../../components/table/XTableHead";
import {Avatar} from "@material-ui/core";
import {fakeUser} from "./types";
import {IUser} from "../../data/types";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Header from "../contacts/Header";
import DataList from "../../components/DataList";
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
