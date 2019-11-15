import React from 'react';
import grey from '@material-ui/core/colors/grey';
import Grid from '@material-ui/core/Grid';
import {IContact, renderName} from "../../types";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import male from "../../../../assets/male.png";
import female from "../../../../assets/female.png";
import Avatar from "@material-ui/core/Avatar";

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
    const isMale = data.person.gender === 'Male'
    return (
        <Grid container justify="flex-start" alignItems="flex-start">
            <Avatar alt="Avatar" src={isMale ? male : female} className={classes.image}/>

            <Grid item className={classes.nameHolder}>
                <Typography variant='h6'>{renderName(data.person)}</Typography>
                <Typography variant='body2'>{data.category}</Typography>
            </Grid>
        </Grid>
    );
}

export default Profile;
