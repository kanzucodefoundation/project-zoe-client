import React, {useEffect, useState} from 'react';
import Layout from "../../components/layout/Layout";
import XTreeData from "../../components/tree/XTreeData";
import arrayToTree from 'array-to-tree'
import {IGroup} from "./types";
import {get, post, search} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import {Grid} from "@material-ui/core";
import InfoMessage from "../../components/messages/InfoMessage";
import Box from "@material-ui/core/Box";
import Header from "../contacts/Header";
import {createNode} from "./treeData";
import {addNodeUnderParent} from "react-sortable-tree";

interface IProps {
}

const GroupsList = (props: IProps) => {

    const [filter, setFilter] = useState<any>({});

    const [data, setData] = useState<IGroup[]>([]);

    useEffect(() => {
        search(remoteRoutes.groups, filter, data => {
            setData(data)
        })
    }, [filter])

    function handleNew() {

    }

    function handleAdd(dt: any) {
        const newNode = createNode(dt.id);
        post(remoteRoutes.groups, newNode, resp => {
            setFilter([...data, resp])
        })
    }

    function handleDetails(dt: any) {

    }

    function handleSearch(query: string) {
        setFilter({...filter, query})
    }

    const treeData: any = arrayToTree(data, {
        parentProperty: 'parent',
        customID: 'id'
    })

    return (
        <Layout>
            <Box p={1}>
                <Header
                    onAddNew={handleNew}
                    title='Contacts'
                    onChange={handleSearch}
                />
            </Box>
            <Grid container>
                <Grid item xs={12} md={4}>
                    <XTreeData data={treeData} onAdd={handleAdd} onDetails={handleDetails}/>
                </Grid>
                <Grid item xs={12} md={8}>
                    <InfoMessage text="Click a group to show details"/>
                </Grid>
            </Grid>
        </Layout>
    );
}


export default GroupsList;
