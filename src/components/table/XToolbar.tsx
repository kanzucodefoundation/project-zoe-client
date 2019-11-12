import React, {Fragment} from 'react';
import clsx from 'clsx';
import {createStyles, lighten, makeStyles, Theme} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import BackspaceIcon from '@material-ui/icons/Backspace';
import FilterListIcon from '@material-ui/icons/FilterList';

const useToolbarStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(1),
        },
        highlight:
            theme.palette.type === 'light'
                ? {
                    color: theme.palette.secondary.main,
                    backgroundColor: lighten(theme.palette.secondary.light, 0.85),
                }
                : {
                    color: theme.palette.text.primary,
                    backgroundColor: theme.palette.secondary.dark,
                },
        spacer: {
            flex: '1 1 100%',
        },
        actions: {
            color: theme.palette.text.secondary,
        },
        title: {
            flex: '0 0 auto',
        },
    }),
);

interface XToolbarProps {
    numSelected: number;
    title: string
    onFilterToggle?: () => any
}

const XToolbar = (props: XToolbarProps) => {
    const classes = useToolbarStyles();
    const {numSelected} = props;

    return (
        <Toolbar
            className={clsx(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            <div className={classes.title}>
                {numSelected > 0 ? (
                    <Typography color="inherit" variant="subtitle1">
                        {numSelected} selected
                    </Typography>
                ) : (
                    <Typography variant="h6" id="tableTitle">
                        {props.title}
                    </Typography>
                )}
            </div>
            <div className={classes.spacer}/>
            <div className={classes.actions}>
                {numSelected > 0 ? (
                    <Fragment>
                        <Tooltip title="Clear">
                            <IconButton aria-label="delete">
                                <BackspaceIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton aria-label="delete">
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                    </Fragment>
                ) : (
                    <Fragment>
                        {
                            props.onFilterToggle ? <Tooltip title="Filter list">
                                <IconButton aria-label="filter list" onClick={props.onFilterToggle}>
                                    <FilterListIcon/>
                                </IconButton>
                            </Tooltip> : null
                        }
                    </Fragment>
                )}
            </div>
        </Toolbar>
    );
};

export default XToolbar
