import React, {useEffect, useState} from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import {IGroup, IGroupMembership} from "../types";
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

interface IProps {
    group: IGroup
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

const MembersList = ({group}: IProps) => {
    const classes = useStyles()
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<IGroupMembership | null>(null);
    const [data, setData] = useState<IGroupMembership[]>([]);

    useEffect(() => {
        setLoading(true);
        search(remoteRoutes.groupsMembership,
            {
                groupId: group.id
            }, data => {
                setData(data)
            }, undefined, () => {
                setLoading(false)
            })
    }, [group.id]);

    function handleAddNew() {

    }

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
                            <ListItem button onClick={handleAddNew} >
                                <Alert severity='info' style={{width: '100%'}}>No members click to add new</Alert>
                            </ListItem> :
                            data.map(mbr => {
                                return (
                                    <ListItem key={mbr.id} button>
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
        </Grid>
    );
}


export default MembersList;
