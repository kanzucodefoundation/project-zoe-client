/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import Table, { Size } from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import grey from '@material-ui/core/colors/grey';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Alert from '@material-ui/lab/Alert';
import { getSorting, Order, stableSort } from './helpers';
import XToolbar from './XToolbar';
import { useTableStyles } from './tableStyles';
import XTableHead, { XHeadCell } from './XTableHead';
import Loading from '../Loading';
import { parseXpath } from '../../utils/jsonHelpers';

interface XTableProps {
  initialSortBy?: string;
  initialOrder?: Order;
  initialRowsPerPage?: number;
  headCells: XHeadCell[];
  title?: string;
  primaryKey?: string;
  data: any[];
  useCheckbox?: boolean;
  handleSelection?: (id: any) => any;
  onFilterToggle?: () => any;
  usePagination?: boolean;
  headerSize?: Size;
  bodySize?: Size;
  loading?: boolean;
}

// The data from the server might be inconsistent, so we need to sanitize it
const isRenderable = (node: any): any => {
  let renderable;
  switch (typeof node) {
    case 'string':
    case 'number':
    case undefined:
    case null:
      renderable = true;
      break;
    default:
      if (Array.isArray(node) && node.length) {
        renderable = node.reduce((acc, e) => acc && isRenderable(e), true);
        break;
      }
      renderable = React.isValidElement(node);
      break;
  }
  return renderable;
};

const sanitizeData = (data: any): any => {
  if (isRenderable(data)) {
    return data;
  }
  return null;
};

export default function XTable(props: XTableProps) {
  const {
    primaryKey = 'id',
    usePagination = true,
    title,
    headCells,
    data,
    useCheckbox,
    initialSortBy = 'id',
    initialOrder = 'asc',
    initialRowsPerPage = 10,
    headerSize = 'medium',
    bodySize = 'medium',
  } = props;
  const classes = useTableStyles();
  const [order, setOrder] = React.useState<Order>(initialOrder);
  const [orderBy, setOrderBy] = React.useState<string>(initialSortBy);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

  function handleRequestSort(
    event: React.MouseEvent<unknown>,
    property: string,
  ) {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }

  function handleSelectAllClick(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.name);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  }

  function handleCheckboxSelection(
    event: React.MouseEvent<unknown>,
    id: string,
  ) {
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

  function handleClick(event: React.MouseEvent<unknown>, id: string) {
    if (useCheckbox) {
      handleCheckboxSelection(event, id);
    } else if (props.handleSelection) {
      props.handleSelection(id);
    }
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

  const isEven = (num: number) => num % 2 !== 0;
  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={0}>
        {title && (
          <XToolbar
            numSelected={selected.length}
            title={title}
            onFilterToggle={props.onFilterToggle}
          />
        )}

        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
          >
            <XTableHead
              headerSize={headerSize}
              headCells={headCells}
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={data.length}
            />
            {props.loading ? (
              <TableBody>
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={headCells.length}>
                    <Loading />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {data.length > 0 ? (
                  stableSort(data, getSorting(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row: any, index: number) => {
                      const isItemSelected = isSelected(row[primaryKey]);
                      const labelId = `enhanced-table-checkbox-${index}`;
                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, row[primaryKey])
                          }
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row[primaryKey]}
                          selected={isItemSelected}
                          style={{
                            backgroundColor: isEven(index) ? 'white' : grey[50],
                          }}
                        >
                          {useCheckbox && (
                            <TableCell padding="checkbox" size={bodySize}>
                              <Checkbox
                                checked={isItemSelected}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </TableCell>
                          )}
                          {headCells.map((it) => (
                            <TableCell
                              size={bodySize}
                              key={it.name}
                              align={it.numeric ? 'right' : 'left'}
                              style={{ whiteSpace: 'nowrap' }}
                              {...it.cellProps}
                            >
                              {it.render
                                ? sanitizeData(
                                  it.render(parseXpath(row, it.name), row),
                                )
                                : sanitizeData(parseXpath(row, it.name))}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow style={{ height: 49 * 2 }}>
                    <TableCell colSpan={headCells.length}>
                      <Alert severity="warning">No records to display</Alert>
                    </TableCell>
                  </TableRow>
                )}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 49 * emptyRows }}>
                    <TableCell colSpan={headCells.length} />
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </div>
        {usePagination && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
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
            onPageChange={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </div>
  );
}
