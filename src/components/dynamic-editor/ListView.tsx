import React from 'react';
import clsx from "clsx";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {parseXpath} from "../../utils/jsonHelpers";
import {Box} from "@material-ui/core";
import EditIconButton, {DeleteIconButton} from "../EditIconButton";
import Button from "@material-ui/core/Button";
import AddIcon from '@material-ui/icons/Add';
import {IColumn} from "./types";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%'
        },
        row: {
            marginLeft: 0,
            paddingLeft: 0,
            paddingBottom: theme.spacing(2),
        },
        col: {
            marginLeft: 0,
            paddingLeft: 0,
            paddingBottom: theme.spacing(1),
        },
        label: {
            margin: 0,
            paddingLeft: 0,
            paddingRight: theme.spacing(2),
            width: 'auto',
        },
        actions: {
            margin: 0,
            paddingLeft: 0,
            paddingRight: 0
        },
        value: {
            width: '100%',
        }
    }),
);


interface IProps {
    data: any[]
    primaryKey: any
    title?: any
    columns: IColumn[]
    onAdd?: () => any
    onEdit?: (data: any) => any
    onDelete?: (data: any) => any
}

const ListView = (props: IProps) => {
    const classes = useStyles();
    return (
        <Box>
            {
                (props.title || props.onAdd) &&
                <>
                    <Box display='flex'>
                        <Box flexGrow={1} pt={0.5}>
                            <Typography variant='h6'>
                                {props.title}
                            </Typography>
                        </Box>
                        <Box >
                            {
                                props.onAdd ?
                                    <Button startIcon={<AddIcon/>} size='small' variant='text'
                                            onClick={props.onAdd}>Add</Button> :
                                    <Button variant='text' size='small' disabled>&nbsp;</Button>
                            }
                        </Box>
                    </Box>
                    <Divider/>
                </>
            }
            <Box pt={0.5}>
                <table className={classes.root}>
                    <tbody>
                    {props.data.map(row => {
                        const primaryKey = row[props.primaryKey]
                        return <tr key={primaryKey} className={classes.row}>
                            {
                                props.columns.map(col => {
                                    return <td key={col.name} className={clsx(classes.col, classes.label)}>
                                        <Box pt={1}>
                                            {col.render ? col.render(parseXpath(row, col.name), row) : parseXpath(row, col.name)}
                                        </Box>
                                    </td>
                                })
                            }
                            {
                                (props.onEdit || props.onDelete) &&
                                <td className={classes.actions} align='right'>
                                    <Box display='flex' flexDirection="row-reverse">
                                        {
                                            props.onEdit &&
                                            <Box>
                                                <EditIconButton onClick={() => props.onEdit && props.onEdit(row)}/>
                                            </Box>
                                        }
                                        {
                                            props.onDelete &&
                                            <Box>
                                                <DeleteIconButton
                                                    onClick={() => props.onDelete && props.onDelete(row)}/>
                                            </Box>
                                        }
                                    </Box>
                                </td>
                            }
                        </tr>
                    })}
                    </tbody>
                </table>
            </Box>

        </Box>
    );
}


export default ListView;
