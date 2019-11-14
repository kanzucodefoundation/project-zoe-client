import React from 'react';
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import {createStyles, Divider, makeStyles, Theme} from "@material-ui/core";

interface IProps {
    title: any
    children?: any
    action?: any
    contentClassName?: string
    cardProps?: any
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            borderRadius: 0
        },
        header: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        }
    })
);

const IBox = (props: IProps) => {
    const classes = useStyles()
    return (
        <Card className={classes.root} {...props.cardProps} elevation={0}>
            <CardHeader
                className={classes.header}
                title={
                    <Typography variant="h6">
                        {props.title}
                    </Typography>
                }
                action={props.action}
            />
            <Divider/>
            <CardContent className={props.contentClassName}>
                {props.children}
            </CardContent>
        </Card>
    );
}

export default IBox;
