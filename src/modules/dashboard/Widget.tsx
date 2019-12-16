import React from 'react';
import {makeStyles} from '@material-ui/styles';
import {Avatar, Card, CardContent, Grid, Theme, Typography} from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

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
        height: 45,
        width: 45
    },
    avatarPlus: {
        backgroundColor: theme.palette.primary.main,
        height: 45,
        width: 45
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
    positiveIcon: {
        color: theme.palette.primary.dark
    },
    differenceValue: {
        color: theme.palette.error.dark,
        marginRight: theme.spacing(1)
    },
    positiveValue: {
        color: theme.palette.primary.dark,
        marginRight: theme.spacing(1)
    }
}));

interface IProps {
    title: string
    value: any
    percentage: number
    icon: any
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
                            {props.title.toLocaleUpperCase()}
                        </Typography>
                        <Typography variant="h6">{props.value}</Typography>
                    </Grid>
                    <Grid item>
                        <Avatar className={props.percentage < 0 ? classes.avatar : classes.avatarPlus}>
                            <props.icon className={classes.icon}/>
                        </Avatar>
                    </Grid>
                </Grid>
                <div className={classes.difference}>
                    {props.percentage < 0 ?
                        <ArrowDownwardIcon className={classes.differenceIcon}/> :
                        <ArrowUpwardIcon className={classes.positiveIcon}/>
                    }

                    <Typography
                        className={props.percentage < 0 ? classes.differenceValue : classes.positiveValue}
                        variant="body2"
                    >
                        {props.percentage}%
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
