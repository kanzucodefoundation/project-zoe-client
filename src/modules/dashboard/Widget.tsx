import React from 'react';
import {makeStyles} from '@material-ui/styles';
import {Avatar, Card, CardContent, Grid, Theme, Typography} from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import MoneyIcon from '@material-ui/icons/Money';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        height: '100%'
    },
    content: {
        alignItems: 'center',
        display: 'flex'
    },
    title: {
        fontWeight: 500
    },
    avatar: {
        backgroundColor: theme.palette.error.main,
        height: 50,
        width: 50
    },
    icon: {
        height: 32,
        width: 32
    },
    difference: {
        marginTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'center'
    },
    differenceIcon: {
        color: theme.palette.error.dark
    },
    differenceValue: {
        color: theme.palette.error.dark,
        marginRight: theme.spacing(1)
    }
}));

interface IProps {

}

const Widget = (props: IProps) => {
    const classes = useStyles();
    return (
        <Card
            className={classes.root}
        >
            <CardContent>
                <Grid
                    container
                    justify="space-between"
                >
                    <Grid item>
                        <Typography
                            className={classes.title}
                            color="textSecondary"
                            gutterBottom
                            variant="body2"
                        >
                            BUDGET
                        </Typography>
                        <Typography variant="h5">$24,000</Typography>
                    </Grid>
                    <Grid item>
                        <Avatar className={classes.avatar}>
                            <MoneyIcon className={classes.icon}/>
                        </Avatar>
                    </Grid>
                </Grid>
                <div className={classes.difference}>
                    <ArrowDownwardIcon className={classes.differenceIcon}/>
                    <Typography
                        className={classes.differenceValue}
                        variant="body2"
                    >
                        12%
                    </Typography>
                    <Typography
                        variant="caption"
                    >
                        Since last month
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
};


export default Widget;
