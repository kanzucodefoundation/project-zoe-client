import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import Typography from '@material-ui/core/Typography';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {Order} from "./helpers";
import {useTableStyles} from "./tableStyles";
import {Size} from "@material-ui/core/Table";


export interface XTableHeadProps {
    classes: ReturnType<typeof useTableStyles>;
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
    headCells: XHeadCell[];
    useCheckbox?: boolean
    headerSize?: Size
}

export interface XHeadCell {
    name: any
    label: string
    numeric?: boolean
    cellProps?: any
    render?: (data: any, rec: any) => any

}

function XTableHead(props: XTableHeadProps) {
    const {headCells, useCheckbox, classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort} = props;
    const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };
    return (
        <TableHead>
            <TableRow className={classes.tableHead}>
                {
                    useCheckbox &&
                    <TableCell padding="checkbox" size={props.headerSize}>
                        <Checkbox

                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{'aria-label': 'select all desserts'}}
                        />
                    </TableCell>
                }

                {headCells.map(headCell => (
                    <TableCell
                        size={props.headerSize}
                        key={headCell.name}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.name ? order : false}
                        component='th'
                        {...headCell.cellProps}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.name}
                            direction={order}
                            onClick={createSortHandler(headCell.name)}
                        >
                            <Typography variant='body2' noWrap><b>{headCell.label.toUpperCase()}</b></Typography>
                            {orderBy === headCell.name ? (
                                <span className={classes.visuallyHidden}>
                                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

export default XTableHead
