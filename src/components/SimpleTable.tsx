import React from 'react';
import {createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import DataLabel from "./DataLabel";
import DataValue from "./DataValue";

export interface ITitle {
    name: string
    title: string
}

interface IProps {
    titles: ITitle[]
    data: any[]
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%'
        },
        row: {},
        col: {
            paddingTop: theme.spacing(1),
        }
    }),
);

const SimpleTable = ({titles, data}: IProps) => {
    const classes = useStyles()
    return (
        <table className={classes.root}>
            <tbody>
            <tr>
                {
                    titles.map(it => (
                        <td key={it.name}>
                            <DataLabel noColon>
                                {it.title}
                            </DataLabel>
                        </td>
                    ))
                }
            </tr>
            {
                data.map((row: any) =>
                    (
                        <tr key={row.id}>
                            {
                                titles.map(it => (
                                    <td key={it.name} className={classes.col}>
                                        <DataValue>
                                            {row[it.name]}
                                        </DataValue>
                                    </td>
                                ))
                            }
                        </tr>
                    ))
            }
            </tbody>
        </table>
    );
}


export default SimpleTable;
