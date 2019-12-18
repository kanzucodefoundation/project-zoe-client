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
import PeopleIcon from "@material-ui/icons/People";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../../components/EditDialog";
import UserGroupEditor from "./UserGroupEditor";
import Loading from "../../../components/Loading";

const columns: XHeadCell[] = [
    {
        name: 'id',
        label: '#',
        render: () => <Avatar><PeopleIcon/></Avatar>,
        cellProps: {
            width: 50
        }
    },
    {
        name: 'name',
        label: 'Name'
    },
    {
        name: 'details',
        label: 'Details',
        cellProps: {
            component: "th", scope: "row"
        }
    }, {
        name: 'roles',
        label: 'Roles',
        render: (data) => <label>{data.length} roles</label>,

    },
]

interface IMobileRow {
    avatar: any
    primary: any
    secondary: any
}

const toMobile = (data: any): IMobileRow => {
    return {
        avatar:  <Avatar><PeopleIcon/></Avatar>,
        primary: data.name,
        secondary: <>
            <Typography variant='caption' color='textSecondary' display='block'>{data.details}</Typography>
            <Typography variant='caption' color='textSecondary'>{data.roles.length} roles</Typography>
        </>,
    }
}


const UserGroups = () => {
    const [filter, setFilter] = useState<any>({})
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<any[]>([])
    const [selected, setSelected] = useState<any | null>(null)
    const [dialog, setDialog] = useState<boolean>(false)
    useEffect(() => {
        setLoading(true)
        search(remoteRoutes.userGroups, filter, resp => {
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
        setSelected(dt)
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
                <Header title='Users Groups' onAddNew={handleNew} onChange={handleFilter}/>
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
                <UserGroupEditor data={selected} isNew={!selected} done={handleComplete}/>
            </EditDialog>
        </Layout>
    );
}

export default UserGroups;
