import React, {Fragment} from 'react';
import {useTheme} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import {XHeadCell} from "./table/XTableHead";

interface IProps {
    data: any[]
    toMobileRow: (data: any) => IMobileRow
    columns: XHeadCell[]
}

const DataList = ({data, columns, toMobileRow}: IProps) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <>
            {isSmall ?
                <List>
                    {
                        data.map((row: any) => {
                            const mobileRow = toMobileRow(row)
                            return <Fragment key={row.id}>
                                <ListItem alignItems="flex-start" button disableGutters>
                                    <ListItemAvatar>
                                        {mobileRow.avatar}
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={mobileRow.primary}
                                        secondary={mobileRow.secondary}
                                    />
                                </ListItem>
                                <Divider component="li"/>
                            </Fragment>
                        })
                    }
                </List> :
                <Table aria-label="simple table" size="small">
                    <TableHead>
                        <TableRow>
                            {
                                columns.map(it =>
                                    <TableCell
                                        key={it.name}
                                        align={it.numeric ? 'right' : 'left'}
                                        component='th'
                                        {...it.cellProps}
                                    >{it.label}</TableCell>)
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row: any) => (
                            <TableRow key={row.id}>
                                {
                                    columns.map((it) => (
                                        <TableCell
                                            key={it.name}
                                            align={it.numeric ? 'right' : 'left'}
                                            {...it.cellProps}>
                                            {it.render ? it.render(row[it.name], row) : row[it.name]}
                                        </TableCell>
                                    ))
                                }

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            }
        </>
    );
}

export interface IMobileRow {
    avatar: any
    primary: any
    secondary: any
}

export default DataList;
