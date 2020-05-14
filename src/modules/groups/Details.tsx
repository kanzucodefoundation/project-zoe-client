import React, {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import {IGroup} from "./types";
import EditDialog from "../../components/EditDialog";
import GroupEditor from "./editors/GroupEditor";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import PeopleIcon from "@material-ui/icons/People";
import Typography from "@material-ui/core/Typography";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {Theme} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import MembersList from "./members/MembersList";
import {grey} from "@material-ui/core/colors";
import {get} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import Loading from "../../components/Loading";
import {Alert} from "@material-ui/lab";
import {useParams} from "react-router";
import Layout from "../../components/layout/Layout";


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

    const [dialog, setDialog] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<IGroup | null>(null)
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

    function handleClose() {
        setDialog(false)
    }

    function handleEdit() {
        setDialog(true)
    }

    function handleDelete() {
        //TODO implement delete
    }

    function handleEdited(dt: any) {
        setDialog(false)
        //onEdited(dt)
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
                            <Box>
                                <MembersList groupId={Number(groupId)}/>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display='flex' justifyContent='flex-end' pt={2}>
                                <Button variant="outlined" color="default" size='small' onClick={handleDelete}>
                                    Delete
                                </Button>
                                <Box pl={1}>
                                    <Button variant="outlined" color="primary" size='small' onClick={handleEdit}>
                                        Edit
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                </Paper>
                <EditDialog open={dialog} onClose={handleClose} title='Edit Group'>
                    <GroupEditor data={data} isNew={false} onGroupEdited={handleEdited}/>
                </EditDialog>
            </Box>
        </Layout>
    );
}
