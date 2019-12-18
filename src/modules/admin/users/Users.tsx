import React, {useEffect, useState} from 'react';
import Layout from "../../../components/layout/Layout";
import {XHeadCell} from "../../../components/table/XTableHead";
import {Avatar} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Header from "../../contacts/Header";
import DataList from "../../../components/DataList";
import {AddFabButton} from "../../../components/EditIconButton";
import {search} from "../../../utils/ajax";
import {remoteRoutes} from "../../../data/constants";
import {hasValue} from "../../../components/inputs/inputHelpers";
import PersonIcon from "@material-ui/icons/Person";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../../components/EditDialog";
import UserEditor from "./UserEditor";
import Loading from "../../../components/Loading";

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
    }, {
        name: 'group',
        label: 'Group'
    },
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


const Users = () => {
    const [filter, setFilter] = useState<any>({})
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<any[]>([])
    const [selected, setSelected] = useState<any | null>(null)
    const [dialog, setDialog] = useState<boolean>(false)
    useEffect(() => {
        setLoading(true)
        search(remoteRoutes.users, filter, resp => {
            setData(resp)
        }, undefined, () => setLoading(false))
    }, [filter])

    function handleFilter(query: string) {
        setFilter({query})
    }

    function handleNew() {
        setSelected(null)
        setDialog(true)
    }

    const handleEdit = (dt: any) => {
        const {id, username, contactId, fullName, groupId, group} = dt
        const toEdit = {
            id,
            username,
            group: {id: groupId, label: group},
            contact: {id: contactId, label: fullName}
        }
        setSelected(toEdit)
        setDialog(true)
    }

    const handleComplete = (dt: any) => {
        if (selected) {
            const newData = data.map((it: any) => {
                if (it.id === dt.id)
                    return dt
                else return it
            })
            setData(newData)
        } else {
            const newData = [...data, dt]
            setData(newData)
        }
        handleClose()
    }
    const handleClose = () => {
        setSelected(null)
        setDialog(false)
    }

    return (
        <Layout>
            <Box p={2}>
                <Header title='Users' onAddNew={handleNew} onChange={handleFilter}/>
                {
                    loading ?
                        <Loading/> :
                        <DataList
                            data={data}
                            toMobileRow={toMobile}
                            columns={columns}
                            onEditClick={handleEdit}
                        />
                }
            </Box>
            <Hidden mdUp>
                <AddFabButton onClick={handleNew}/>
            </Hidden>
            <EditDialog title={selected ? 'Edit User' : 'Create User'} open={dialog} onClose={handleClose}>
                <UserEditor data={selected} isNew={!selected} done={handleComplete}/>
            </EditDialog>
        </Layout>
    );
}

export default Users;
