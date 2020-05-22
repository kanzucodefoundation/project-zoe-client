import React, {useEffect, useState} from 'react';
import Layout from "../../components/layout/Layout";
import XTreeData from "../../components/tree/XTreeData";
import arrayToTree from 'array-to-tree'
import {IGroup} from "./types";
import {search} from "../../utils/ajax";
import {localRoutes, remoteRoutes} from "../../data/constants";
import InfoMessage from "../../components/messages/InfoMessage";
import Box from "@material-ui/core/Box";
import Header from "../contacts/Header";
import EditDialog from "../../components/EditDialog";
import GroupEditor from "./editors/GroupEditor";
import Loading from "../../components/Loading";
import {useHistory} from "react-router";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        groupsHolder: {
            width: 500,
            maxWidth: '100%',
            // [theme.breakpoints.down('sm')]: {
            //     paddingRight:theme.spacing(1)
            // },
        }
    }),
);

const GroupsList = () => {

    const classes = useStyles();
    const history = useHistory()
    const [loading, setLoading] = useState<boolean>(true);
    const [dialog, setDialog] = useState<boolean>(false);
    const [filter, setFilter] = useState<any>({});
    const [selected, setSelected] = useState<IGroup | null>(null);
    const [data, setData] = useState<IGroup[]>([]);


    useEffect(() => {
        setLoading(true);
        search(remoteRoutes.groups, filter, data => {
            setData(data)
            console.log("Got Data",data)
        }, undefined, () => {
            setLoading(false)
        })
    }, [filter]);

    function handleClose() {
        setDialog(false)
    }


    function handleNew() {
        setSelected(null);
        setDialog(true)
    }

    function handleAddUnder(dt: any) {
        setSelected(dt);
        setDialog(true)
    }

    function handleAdded(dt: any) {
        setSelected(dt);
        setDialog(false);
        setData([...data, dt])
    }

    function handleDetails(dt: any) {
        history.push(`${localRoutes.groups}/${dt.id}`)
    }

    function handleSearch(query: string) {
        setFilter({...filter, query})
    }

    const openRecords = data.map(it => it.id);

    console.log("Converting to tree")
    const treeData: any = arrayToTree(data, {
        parentProperty: 'parentId',
        customID: 'id'
    });
    console.log("Done converting to tree")
    const starterData = selected ? {
        parent: {
            id: selected.id, name: selected.name
        }
    } : undefined;
    return (
        <Layout>
            <Box p={1}>
                <Header
                    onAddNew={handleNew}
                    title='Groups'
                    onChange={handleSearch}
                />
                <Box display='flex' justifyContent='center'>
                    {
                        loading ? <Loading/> :
                            data.length > 0 ?
                                <div className={classes.groupsHolder}>
                                    <XTreeData
                                        data={treeData}
                                        open={openRecords}
                                        onAddUnder={handleAddUnder}
                                        onDetails={handleDetails}
                                    />
                                </div>
                                :
                                <InfoMessage text='No records found'/>
                    }
                </Box>
            </Box>
            <EditDialog open={dialog} onClose={handleClose} title='Add new group'>
                <GroupEditor data={starterData} isNew={true} onGroupAdded={handleAdded}/>
            </EditDialog>
        </Layout>
    );
};

export default GroupsList;
