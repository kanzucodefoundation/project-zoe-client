import React, {useEffect, useState} from 'react';
import Layout from "../../components/layout/Layout";
import {XHeadCell} from "../../components/table/XTableHead";
import {Avatar} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Header from "../contacts/Header";
import DataList from "../../components/DataList";
import {AddFabButton} from "../../components/EditIconButton";
import {search} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import {hasValue} from "../../components/inputs/inputHelpers";
import PersonIcon from "@material-ui/icons/Person";
import Hidden from "@material-ui/core/Hidden";
interface IProps {
}
const columns: XHeadCell[] = [
    {
        name: 'avatar',
        label: 'Avatar',
        render: (data) => {
            const hasAvatar = hasValue(data)
            return hasAvatar ?
                <Avatar
                    alt="Avatar"
                    src={data}
                /> : <Avatar><PersonIcon/></Avatar>
        },
        cellProps: {
            width: 50
        }
    },
    {
        name: 'username',
        label: 'Username'
    },
    {
        name: 'fullName',
        label: 'Full Name',
        cellProps: {
            component: "th", scope: "row"
        }
    }
]

interface IMobileRow {
    avatar: any
    primary: any
    secondary: any
}

const toMobile = (data: any): IMobileRow => {
    const hasAvatar = hasValue(data.avatar)
    return {
        avatar: hasAvatar ?
            <Avatar
                alt="Avatar"
                src={data.person.avatar}
            /> : <Avatar><PersonIcon/></Avatar>,
        primary: data.fullName,
        secondary: <>
            <Typography variant='caption' color='textSecondary' display='block'>{data.email}</Typography>
            <Typography variant='caption' color='textSecondary'>{data.username}</Typography>
        </>,
    }
}



const Users = (props: IProps) => {
    const [query, setQuery] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<[]>([])
    useEffect(() => {
        setLoading(true)
        search(remoteRoutes.users, {}, resp => {
            setData(resp)
        }, undefined, () => setLoading(false))
    }, [query])

    function handleFilterToggle() {

    }

    function handleNew() {

    }

    const handleEdit=(dt:any) =>{

    }

    return (
        <Layout>
            <Box p={2}>
                <Header title='Users' onAddNew={handleNew} onFilterToggle={handleFilterToggle}/>
                <DataList
                    data={data}
                    toMobileRow={toMobile}
                    columns={columns}
                    onEditClick={handleEdit}
                />
            </Box>
            <Hidden mdUp>
                <AddFabButton onClick={handleNew}/>
            </Hidden>
        </Layout>
    );
}

export default Users;
