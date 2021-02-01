import React, {useEffect, useState} from 'react';
import Layout from "../../../components/layout/Layout";
import { useHistory } from 'react-router';
import {XHeadCell} from "../../../components/table/XTableHead";
import {Avatar} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Header from "../../contacts/Header";
import DataList from "../../../components/DataList";
import {AddFabButton} from "../../../components/EditIconButton";
import {search} from "../../../utils/ajax";
import {localRoutes, remoteRoutes} from "../../../data/constants";
import {hasValue} from "../../../components/inputs/inputHelpers";
import PersonIcon from "@material-ui/icons/Person";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../../components/EditDialog";
import UserEditor from "./UserEditor";
import Loading from "../../../components/Loading";
import Chip from '@material-ui/core/Chip';

const columns: XHeadCell[] = [
    {
        name: 'isActive',
        label: 'Status',
        render: (value) => 
        <Chip 
            label={value ? "Active" : "Inactive"} 
            color="secondary" 
            size="small"
        />
    },
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
        name: 'roles',
        label: 'Roles',
        render: (roles: string[]) => roles?.map(it => (
            <Chip
                color='primary'
                variant='outlined'
                key={it}
                style={{margin: 5, marginLeft: 0, marginTop: 0}}
                size='small'
                label={it}
            />
        ))
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
                src={data.avatar}
            /> : <Avatar><PersonIcon/></Avatar>,
        primary: <>
            {`${data.fullName}\t`}
            <Chip label={data.isActive ? "Active" : "Inactive"} color="secondary" size="small"/>
            </>,
        secondary: <>
            <Typography variant='caption' color='textSecondary'>{data.username}</Typography>
            <div>{data.roles?.map((it: any) => (
                <Chip
                    color='primary'
                    variant='outlined'
                    key={it}
                    style={{margin: 5, marginLeft: 0, marginTop: 0}}
                    size='small'
                    label={it}
                />
            ))}</div>

        </>,
    }
}


const Users = () => {
    const history = useHistory();
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
        const {id, username, contactId, fullName, roles, isActive} = dt
        const toEdit = {
            id,
            username,
            roles: [...roles],
            contact: {id: contactId, label: fullName},
            isActive: isActive,
        }
        setSelected(toEdit)
        setDialog(true)
    }

    const handleView = (dt: any) => {
        history.push(`${localRoutes.contacts}/${dt.id}`)  
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

    function handleDeleted(dt: any) {
        const newData = data.filter((it: any) => it.id !== dt.id)
        setData(newData)
    }

    return (
        <Layout>
            <Box p={1}>
                <Header title='Users' onAddNew={handleNew} onChange={handleFilter}/>
                {
                    loading ?
                        <Loading/> :
                        <DataList
                            data={data}
                            toMobileRow={toMobile}
                            columns={columns}
                            onEditClick={handleEdit}
                            onViewClick={handleView}
                        />
                }
            </Box>
            <Hidden mdUp>
                <AddFabButton onClick={handleNew}/>
            </Hidden>
            <EditDialog title={selected ? `Edit ${selected.username}` : 'Create User'} open={dialog}
                        onClose={handleClose}>
                <UserEditor data={selected} isNew={!selected} done={handleComplete} onDeleted={handleDeleted}
                            onCancel={handleClose}/>
            </EditDialog>
        </Layout>
    );
}

export default Users;
