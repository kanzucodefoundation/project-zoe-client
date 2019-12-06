import React, {useEffect, useState} from 'react';
import Layout from "../../components/layout/Layout";
import XTreeData from "../../components/tree/XTreeData";
import arrayToTree from 'array-to-tree'
import {IGroup} from "./types";
import {search} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import {Grid} from "@material-ui/core";
import InfoMessage from "../../components/messages/InfoMessage";
import Box from "@material-ui/core/Box";
import Header from "../contacts/Header";
import Details from "./Details";
import EditDialog from "../../components/EditDialog";
import GroupEditor from "./GroupEditor";
import Loading from "../../components/Loading";
import Hidden from "@material-ui/core/Hidden";
import {useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const GroupsList = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [dialog, setDialog] = useState<boolean>(false)
    const [detailsDialog, setDetailsDialog] = useState<boolean>(false)
    const [filter, setFilter] = useState<any>({});
    const [selected, setSelected] = useState<IGroup | null>(null);
    const [data, setData] = useState<IGroup[]>([]);
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setLoading(true)
        search(remoteRoutes.groups, filter, data => {
            setData(data)
        }, undefined, () => {
            setLoading(false)
        })
    }, [filter])

    function handleClose() {
        setDialog(false)
    }

    function handleCloseDetailsDialog() {
        setDetailsDialog(false)
    }

    function handleNew() {
        setSelected(null)
        setDialog(true)
    }

    function handleAddUnder(dt: any) {
        setSelected(dt)
        setDialog(true)
    }

    function handleAdded(dt: any) {
        setSelected(dt)
        setDialog(false)
        setData([...data, dt])
    }

    function handleDetails(dt: any) {
        setDetailsDialog(true)
        setSelected(dt)
    }

    function handleEdited(dt: any) {
        const newData = data.filter(it => it.id !== dt.id)
        setData([...newData, dt])
        setSelected(dt)
    }

    function handleSearch(query: string) {
        setFilter({...filter, query})
    }

    const openRecords = data.map(it => it.id)

    const treeData: any = arrayToTree(data, {
        parentProperty: 'parent',
        customID: 'id'
    })
    const starterData = selected ? {parent: selected.id} : undefined
    return (
        <Layout>
            <Box p={1}>
                <Header
                    onAddNew={handleNew}
                    title='Groups'
                    onChange={handleSearch}
                />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                        {
                            loading ? <Loading/> :
                                data.length > 0 ?
                                    <XTreeData
                                        data={treeData}
                                        open={openRecords}
                                        onAddUnder={handleAddUnder}
                                        onDetails={handleDetails}
                                    /> :
                                    <InfoMessage text='No records found'/>
                        }

                    </Grid>
                    <Hidden smDown>
                        <Grid item xs={12} md={7}>
                            {
                                selected ?
                                    <Details data={selected} onEdited={handleEdited}/> :
                                    <InfoMessage text="Click a group to show details"/>
                            }
                        </Grid>
                    </Hidden>
                    <Hidden mdUp>
                        <EditDialog open={detailsDialog} onClose={handleCloseDetailsDialog} title=''>
                            {
                                selected ?
                                    <Details data={selected} onEdited={handleEdited}/> :
                                    <InfoMessage text="Click a group to show details"/>
                            }
                        </EditDialog>
                    </Hidden>

                </Grid>
            </Box>
            <EditDialog open={dialog} onClose={handleClose} title='Add new group'>
                <GroupEditor data={starterData} isNew={true} onGroupAdded={handleAdded}/>
            </EditDialog>
        </Layout>
    );
}

export default GroupsList;
