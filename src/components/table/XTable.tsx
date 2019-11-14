import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import grey from '@material-ui/core/colors/grey';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import {getSorting, Order, stableSort} from "./helpers";
import XToolbar from "./XToolbar";
import {useTableStyles} from "./tableStyles";
import XTableHead, {XHeadCell} from "./XTableHead";

interface XTableProps {
    initialSortBy?: string
    initialOrder?: Order
    initialRowsPerPage?: number
    headCells: XHeadCell[]
    title?: string
    data: any[]
    useCheckbox?: boolean
    handleSelection?: (id: any) => any
    onFilterToggle?: () => any
}

export default function XTable(props: XTableProps) {
    const {title, headCells, data, useCheckbox, initialSortBy = 'id', initialOrder = 'asc', initialRowsPerPage = 10} = props
    const classes = useTableStyles();
    const [order, setOrder] = React.useState<Order>(initialOrder);
    const [orderBy, setOrderBy] = React.useState<string>(initialSortBy);
    const [selected, setSelected] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

    function handleRequestSort(event: React.MouseEvent<unknown>, property: string) {
        const isDesc = orderBy === property && order === 'desc';
        setOrder(isDesc ? 'asc' : 'desc');
        setOrderBy(property);
    }

    function handleSelectAllClick(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.checked) {
            const newSelected = data.map(n => n.name);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    }

    function handleClick(event: React.MouseEvent<unknown>, id: string) {
        if (useCheckbox) {
            handleCheckboxSelection(event, id)
        } else {
            if (props.handleSelection) {
                props.handleSelection(id);
            }
        }
    }

    function handleCheckboxSelection(event: React.MouseEvent<unknown>, id: string) {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    }

    function handleChangePage(event: unknown, newPage: number) {
        setPage(newPage);
    }

    function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
        setRowsPerPage(+event.target.value);
        setPage(0);
    }

    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    const isEven = (num: number) => num % 2 !== 0
    return (
        <div className={classes.root}>
            <Paper className={classes.paper} elevation={0}>
                {
                    title &&
                    <XToolbar numSelected={selected.length} title={title} onFilterToggle={props.onFilterToggle}/>
                }

                <div className={classes.tableWrapper}>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size="medium"
                    >
                        <XTableHead
                            headCells={headCells}
                            classes={classes}
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={data.length}
                        />
                        <TableBody>
                            {stableSort(data, getSorting(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row: any, index: number) => {
                                    const isItemSelected = isSelected(row.id);
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => handleClick(event, row.id)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.id}
                                            selected={isItemSelected}
                                            style={{backgroundColor: isEven(index) ? grey[100] : 'white'}}
                                        >
                                            {
                                                useCheckbox &&
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        inputProps={{'aria-labelledby': labelId}}
                                                    />
                                                </TableCell>
                                            }
                                            {
                                                headCells.map(it => (
                                                    <TableCell
                                                        key={it.name}
                                                        align={it.numeric ? 'right' : 'left'}
                                                        {...it.cellProps}>
                                                        {it.render ? it.render(row[it.name], row) : row[it.name]}
                                                    </TableCell>
                                                ))
                                            }
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{height: 49 * emptyRows}}>
                                    <TableCell colSpan={6}/>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                        'aria-label': 'previous page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'next page',
                    }}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}
