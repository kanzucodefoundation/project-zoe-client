import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import {IGroup} from "./types";
import EditDialog from "../../components/EditDialog";
import GroupEditor from "./GroupEditor";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import PersonIcon from "@material-ui/icons/People";
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {Theme} from "@material-ui/core";

interface IProps {
    data: IGroup
    onEdited: (data: any) => any
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            [theme.breakpoints.only('md')]: {
                maxWidth: 350
            },
            [theme.breakpoints.up('lg')]: {
                maxWidth: 450
            },
            [theme.breakpoints.down('sm')]: {
                width: '100%'
            }
        },
    }),
);

export default function Details({data, onEdited}: IProps) {
    const [dialog, setDialog] = useState<boolean>(false)
    const classes = useStyles()

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
        onEdited(dt)
    }

    return (
        <Box px={1} display='flex' justifyContent='center'>
            <Card className={classes.root} elevation={0}>
                <CardHeader
                    avatar={
                        <Avatar><PersonIcon/></Avatar>
                    }
                    title={<Typography variant='body1'>{data.name}</Typography>}
                    subheader={`${data.privacy}, ${data.tag}`}
                />
                <CardContent>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {data.description}
                    </Typography>
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
                </CardContent>
                <EditDialog open={dialog} onClose={handleClose} title='Edit Group'>
                    <GroupEditor data={data} isNew={false} onGroupEdited={handleEdited}/>
                </EditDialog>
            </Card>
        </Box>
    );
}
