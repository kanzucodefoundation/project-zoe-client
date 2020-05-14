import React, {useCallback, useEffect, useState} from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import {IGroupMembership} from "../types";
import {search} from "../../../utils/ajax";
import {remoteRoutes} from "../../../data/constants";
import XAvatar from "../../../components/XAvatar";
import {Grid} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import Divider from "@material-ui/core/Divider";
import {Alert} from "@material-ui/lab";
import Loading from "../../../components/Loading";
import EditDialog from "../../../components/EditDialog";
import MembersEditor from "./MembersEditor";

interface IProps {
    groupId: number
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
    }),
);

const MembersList = ({groupId}: IProps) => {
    const classes = useStyles()
    const [loading, setLoading] = useState<boolean>(false);
    const [addingMembers, setAddingMembers] = useState<boolean>(false);
    const [selected, setSelected] = useState<IGroupMembership | null>(null);
    const [data, setData] = useState<IGroupMembership[]>([]);

    const fetchMembers = useCallback(() => {
        setLoading(true);
        search(remoteRoutes.groupsMembership,
            {
                groupId: groupId
            }, data => {
                setData(data)
            }, undefined, () => {
                setLoading(false)
            })
    }, [groupId]);

    useEffect(() => {
        fetchMembers()
    }, [fetchMembers]);

    function handleAddNew() {
        setAddingMembers(true)
    }

    function handleCloseDialog() {
        setAddingMembers(false)
    }

    const handleSelected = (mbr: IGroupMembership) => () => {
        setSelected(mbr)
    }

    function handleDone() {
        fetchMembers()
        setAddingMembers(false)
    }

    if (loading)
        return <Loading/>

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box display='flex' pt={1}>
                    <Box pt={0.5} pr={3}>
                        <Typography variant='h6' style={{fontSize: '0.92rem'}}>Members</Typography>
                    </Box>
                    <Box display='flex' justifyContent='flex-end'>
                        <Button
                            variant="text"
                            color="primary"
                            startIcon={<AddIcon/>}
                            onClick={handleAddNew}
                            size='small'
                        >
                            Add New&nbsp;&nbsp;
                        </Button>
                    </Box>
                </Box>
                <Divider/>
            </Grid>
            <Grid item xs={12}>
                <List dense className={classes.root}>
                    {
                        data.length === 0 ?
                            <ListItem button onClick={handleAddNew}>
                                <Alert severity='info' style={{width: '100%'}}>No members click to add new</Alert>
                            </ListItem> :
                            data.map(mbr => {
                                return (
                                    <ListItem key={mbr.id} button onClick={handleSelected(mbr)}>
                                        <ListItemAvatar>
                                            <XAvatar data={mbr.contact}/>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={mbr.contact.name}
                                            secondary={`Role: ${mbr.role}`}
                                        />
                                    </ListItem>
                                );
                            })}
                </List>
            </Grid>

            <EditDialog
                open={addingMembers}
                onClose={handleCloseDialog}
                title="MembersEditor"
                maxWidth="lg"
            >
                <MembersEditor group={{id: groupId}} done={handleDone}/>
            </EditDialog>
        </Grid>
    );
}


export default MembersList;
