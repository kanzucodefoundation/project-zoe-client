import React from 'react';
import grey from '@material-ui/core/colors/grey';
import PersonIcon from '@material-ui/icons/AccountBox';
import Grid from '@material-ui/core/Grid';
import {IContact, renderName} from "../../types";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

interface IProps {
    data: IContact
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2),
            borderRadius: 0
        },

        image: {
            height: 70,
            width: 70,
            marginRight: theme.spacing(1),
            color: grey[500]
        },
        nameHolder: {
            paddingTop: theme.spacing(1)
        }
    })
);

const Profile = ({data}: IProps) => {
    const classes = useStyles()
    return (
        <Grid container justify="flex-start" alignItems="flex-start">
            <PersonIcon className={classes.image}/>
            <Grid item className={classes.nameHolder}>
                <Typography variant='h6'>{renderName(data.person)}</Typography>
                <Typography variant='body2'>{data.category}</Typography>
            </Grid>
        </Grid>
    );
}

export default Profile;
