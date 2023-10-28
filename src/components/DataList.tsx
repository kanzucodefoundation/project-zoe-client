import React, { Fragment } from 'react';
import { Paper, TablePagination, useTheme } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery/useMediaQuery';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Alert } from '@material-ui/lab';
import { XHeadCell } from './table/XTableHead';
import { getSorting, stableSort } from './table/helpers';
import { useTableStyles } from './table/tableStyles';

interface IProps {
  data: any[];
  toMobileRow: (data: any) => IMobileRow;
  columns: XHeadCell[];
  onEditClick?: (data: any) => any;
  onViewClick?: (data: any) => any;
  initialRowsPerPage?: number;
  usePagination?: boolean;
}

const DataList = ({
  data,
  columns,
  toMobileRow,
  onEditClick,
  onViewClick,
  usePagination = true,
  initialRowsPerPage = 10,
}: IProps) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const classes = useTableStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={0}>
        <Fragment>
          {isSmall ? (
            <List>
              {data.map((row: any) => {
                const mobileRow = toMobileRow(row);
                return (
                  <Fragment key={row.id}>
                    <ListItem alignItems="flex-start" disableGutters>
                      {mobileRow.avatar && (
                        <>
                          <ListItemAvatar>{mobileRow.avatar}</ListItemAvatar>
                        </>
                      )}

                      <ListItemText
                        disableTypography
                        primary={mobileRow.primary}
                        secondary={mobileRow.secondary}
                      />
                      {onViewClick && (
                        <IconButton
                          onClick={() => onViewClick && onViewClick(row)}
                          size="medium"
                          color="primary"
                          aria-label="edit"
                          component="span"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      )}
                      {onEditClick && row.role !== 'RoleAdmin' && (
                        <IconButton
                          onClick={() => onEditClick && onEditClick(row)}
                          size="medium"
                          color="primary"
                          aria-label="edit"
                          component="span"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </ListItem>
                    <Divider component="li" />
                  </Fragment>
                );
              })}
            </List>
          ) : (
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  {columns.map((it) => (
                    <TableCell
                      key={it.name}
                      align={it.numeric ? 'right' : 'left'}
                      component="th"
                      {...it.cellProps}
                    >
                      {it.label}
                    </TableCell>
                  ))}
                  {onViewClick && (
                    <TableCell align="center" component="th">
                      &nbsp;
                    </TableCell>
                  )}
                  {onEditClick && (
                    <TableCell align="center" component="th">
                      &nbsp;
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  stableSort(data, getSorting('asc', 'id'))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row: any) => (
                      <TableRow key={row.id}>
                        {columns.map((it) => (
                          <TableCell
                            key={it.name}
                            align={it.numeric ? 'right' : 'left'}
                            {...it.cellProps}
                          >
                            {it.render
                              ? it.render(row[it.name], row)
                              : row[it.name]}
                          </TableCell>
                        ))}
                        {onViewClick && (
                          <TableCell align="center">
                            <IconButton
                              size="medium"
                              color="primary"
                              aria-label="edit"
                              component="span"
                              onClick={() => onViewClick && onViewClick(row)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        )}
                        {onEditClick && (
                          <TableCell align="center">
                            {row.role !== 'RoleAdmin' && (
                              <IconButton
                                size="medium"
                                color="primary"
                                aria-label="edit"
                                component="span"
                                onClick={() => onEditClick && onEditClick(row)}
                              >
                                <EditIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                ) : (
                  <TableRow style={{ height: 49 * 2 }}>
                    <TableCell colSpan={columns.length}>
                      <Alert severity="warning">No records to display</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Fragment>
        {usePagination && (
          <TablePagination
            component="div"
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
};

export interface IMobileRow {
  avatar?: any;
  primary: any;
  secondary: any;
}

export default DataList;
