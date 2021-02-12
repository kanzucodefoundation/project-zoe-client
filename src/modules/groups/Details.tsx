import React, {useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {IGroup} from "./types";
import EditDialog from "../../components/EditDialog";
import GroupEditor from "./editors/GroupEditor";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import PinDropIcon from '@material-ui/icons/PinDrop';
import PeopleIcon from "@material-ui/icons/People";
import Typography from "@material-ui/core/Typography";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {Theme} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import EditIcon from '@material-ui/icons/Edit';
import MembersList from "./members/MembersList";
import {grey} from "@material-ui/core/colors";
import {get} from "../../utils/ajax";
import {appRoles, localRoutes, remoteRoutes} from "../../data/constants";
import Loading from "../../components/Loading";
import {Alert} from "@material-ui/lab";
import {useHistory, useParams} from "react-router";
import Layout from "../../components/layout/Layout";
import IconButton from "@material-ui/core/IconButton";
import MapLink from "../../components/MapLink";
import {IState} from "../../data/types";
import {hasAnyRole} from '../../data/appRoles';
import MemberRequests from './members/MemberRequests';
import TabbedView from "./TabbedView";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%'
        },
        largeIcon: {
            width: theme.spacing(6),
            height: theme.spacing(6),
        },

        rootPaper: {
            padding: theme.spacing(2),
            borderRadius: 0
        },
        description: {
            minHeight: 100,
            borderRadius: 5,
            backgroundColor: grey[100]
        }
    }),
);

export default function Details() {

    let {groupId} = useParams();
    const history = useHistory();
    const [dialog, setDialog] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<IGroup | null>(null)
    const profile = useSelector((state: IState) => state.core.user);
    const classes = useStyles()

    useEffect(() => {
        setLoading(true);
        get(`${remoteRoutes.groups}/${groupId}`,
            data => {
                setData(data)
            }, undefined, () => {
                setLoading(false)
            })
    }, [groupId])


    const isLeader = () => {
        const userId = `${profile.id}`
        const _leaderIds: number[] = data?.leaders || [];
        const leaderIds: string[] = _leaderIds.map(it => `${it}`);

        const isLeader = leaderIds.indexOf(userId) > -1;

        return isLeader || hasAnyRole(profile, [appRoles.roleGroupEdit]);
        // Both leaders and people with the groupEdit role should be able to edit a group

    }

    function handleClose() {
        setDialog(false)
    }

    function handleEdit() {
        setDialog(true)
    }


    function handleEdited(dt: any) {
        setDialog(false)
        setData(dt)
    }

    if (loading)
        return <Layout>
            <Loading/>
        </Layout>

    if (!data)
        return <Layout>
            <Box p={4} className={classes.root} display='flex' justifyContent='center'>
                <Alert severity='error'>Failed to load group data</Alert>
            </Box>
        </Layout>


    function handleDeleted() {
        history.push(localRoutes.groups)
    }

    const tabs = [
        {
            name:"Members",
            component:<MembersList groupId={Number(groupId)}/>
        }
    ]
    if(isLeader()){
        tabs.push({
            name:"Pending requests",
            component:<MemberRequests group={data}/>
        })
    }

    return (
        <Layout>
            <Box p={2} className={classes.root}>
                <Paper className={classes.rootPaper}>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Box display='flex' pb={1}>
                                <Box pr={2}>
                                    <Avatar className={classes.largeIcon}><PeopleIcon/></Avatar>
                                </Box>
                                <Box flexGrow={1}>
                                    <Typography variant='h6'>{data.name}</Typography>
                                    <Typography variant='body2'>{`${data.privacy}, ${data.category.name}`}</Typography>
                                </Box>


                                {
                                    isLeader() ?
                                        <Box pr={2}>
                                            <IconButton
                                                aria-label="Edit"
                                                color='primary'
                                                title='Edit Group'
                                                onClick={handleEdit}>
                                                <EditIcon/>
                                            </IconButton>
                                        </Box>
                                        :
                                        null
                                }

                            </Box>
                            <Divider/>
                            <Box display='flex' pt={1}>
                                <Box pr={2}>
                                    <PinDropIcon/>
                                </Box>
                                <Box flexGrow={1} pt={0.5}>
                                    {
                                        data.placeId ?
                                            <MapLink title={data.freeForm!} value={data.placeId!}/> :
                                            <Typography variant='caption'>No address</Typography>

                                    }
                                </Box>
                            </Box>
                            <Divider/>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display='flex' flexDirection='column'>
                                <Box pb={1}>
                                    <Typography variant='h6' style={{fontSize: '0.92rem'}}>Details</Typography>
                                </Box>
                                <Box className={classes.description} p={2}>
                                    <Typography variant='body2'>
                                        {data.details}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <TabbedView
                                tabs={tabs}
                            />
                        </Grid>
                    </Grid>

                </Paper>
                <EditDialog open={dialog} onClose={handleClose} title='Edit Group'>
                    <GroupEditor data={data} isNew={false} onUpdated={handleEdited} onDeleted={handleDeleted}/>
                </EditDialog>
            </Box>
        </Layout>
    );
}
