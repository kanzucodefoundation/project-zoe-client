import React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {chunkArray} from "../utils/arrayHelpers";
import DataLabel from "./DataLabel";
import DataValue from "./DataValue";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%'
        },
        row: {},
        col: {
            paddingBottom: theme.spacing(1),
        }
    }),
);

export interface IRec {
    label: string
    value: any
}

interface IProps {
    data: IRec[]
    columns?: number
}

const TableView = ({data}: IProps) => {
    const classes = useStyles();
    return (
        <table className={classes.root}>
            <tbody>
            {data.map(row => row.label!==''?(
                <tr key={row.label}>
                    <td className={classes.col}>
                        <DataLabel>
                            {row.label}
                        </DataLabel>
                    </td>
                    <td className={classes.col}>
                        <DataValue>
                            {row.value}
                        </DataValue>
                    </td>
                </tr>
            ):<tr><td colSpan={2}/>&nbsp;</tr>)}
            </tbody>
        </table>
    );
}

const DetailView = ({data, columns}: IProps) => {
    const classes = useStyles();
    if (columns) {
        const parts = chunkArray(data, columns)
        return (
            <table className={classes.root}>
                <tbody>
                <tr>
                    {
                        parts.map((part, index) => (
                            <td key={index} style={{verticalAlign:'top'}}>
                                <TableView data={part}/>
                            </td>
                        ))
                    }
                </tr>
                </tbody>
            </table>
        );
    } else {
        return <TableView data={data}/>
    }
}


export default DetailView;
