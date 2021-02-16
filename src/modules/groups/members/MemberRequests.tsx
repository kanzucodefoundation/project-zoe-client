import { Box, Divider, Grid, IconButton, ListItem, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { remoteRoutes } from '../../../data/constants';
import { search, del, post } from '../../../utils/ajax';
import { Alert } from '@material-ui/lab';
import XAvatar from '../../../components/XAvatar';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import Toast from '../../../utils/Toast';
import { useHistory } from 'react-router';

const MemberRequests = (props: any) => {

    const history = useHistory();
    const [data, setData] = useState<any[]>([]);
    const [isLocation, setIsLocation] = useState<boolean>(false);

    function handleApprove(dt: any) {
        const toSave = {
            groupId: props.group.id,
            members: [dt.contactId],
            role: 'Member'
        }
        post(`${remoteRoutes.groupsMembership}`, toSave, resp => {
           Toast.info("USER REQUEST APPROVED")
           del(`${remoteRoutes.groupsRequest}/${dt.id}`, resp => {
                setTimeout(() => history.go(0), 3000)
            })
        })
    }

    function handleDelete(dt: any) {
        del(`${remoteRoutes.groupsRequest}/${dt}`, resp => {
            Toast.info("USER REQUEST DENIED");
            setTimeout(() => history.go(0), 3000)
        })
    }

    useEffect(() => {
        let filter = {};
        if (props.group.categoryId === "Location") {
            setIsLocation(true)
            filter = {parentId: props.group.id}
        } else {
            filter = {groupId: props.group.id}
        }
        search(remoteRoutes.groupsRequest, filter, resp => {
            setData(resp)
        })
    }, [props.group.categoryId, props.group.id])

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box display='flex' flexDirection='column'>
                    <Box pb={1}>
                        <Typography variant='h6' style={{fontSize: '0.92rem'}}>Pending Members</Typography>
                    </Box>
                    <Divider/>
                    <Box>
                        {
                            data.length === 0 ?
                                <ListItem>
                                    <Alert severity='info' style={{width: '100%'}}>No Pending Memberships</Alert>
                                </ListItem>
                                :
                                data.map(mbr => {
                                    return (
                                        <ListItem key={mbr.id}>
                                            <ListItemAvatar>
                                                <XAvatar data={mbr.contact.avatar}/>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={mbr.contact.fullName}
                                                secondary={isLocation ? `${mbr.group.name}` : null}
                                            />
                                            {
                                                isLocation ? null :
                                                    <>
                                                        <IconButton
                                                            color='primary'
                                                            size='medium'
                                                            onClick={() => handleApprove(mbr)}
                                                        >
                                                            <CheckCircleIcon/>
                                                        </IconButton>
                                                        <IconButton
                                                            color='secondary'
                                                            size='medium'
                                                            onClick={() => handleDelete(mbr.id)}
                                                        >
                                                            <CancelIcon/>
                                                        </IconButton>
                                                    
                                                    </>
                                            } 
                                        </ListItem>
                                    )
                                })
                            }
                    </Box>
                </Box>

            </Grid>
        </Grid>
    )
}

export default MemberRequests

