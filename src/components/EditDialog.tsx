import React from 'react';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {Dialog, DialogContent, DialogTitle} from "@material-ui/core";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import {themeBackground} from "../theme/custom-colors";

interface IProps {
    open: boolean
    onClose: () => any
    title: string
    children?: any
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            backgroundColor: themeBackground,
            position: 'relative',
        },
        title: {
            marginLeft: theme.spacing(2),
            flex: 1,
        },
    }),
);

const EditDialog = (props: IProps) => {
    const classes = useStyles();
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Dialog open={props.open} onClose={props.onClose} fullScreen={matches} >

            {
                matches ?
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={props.onClose} aria-label="close">
                                <CloseIcon/>
                            </IconButton>
                            <Typography variant="h6" className={classes.title}>
                                {props.title}
                            </Typography>
                        </Toolbar>
                    </AppBar> :
                    <DialogTitle>{props.title}</DialogTitle>
            }
            <DialogContent>
                {props.children}
            </DialogContent>
        </Dialog>
    );
}


export default EditDialog;
