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
  handleOpenModal: (rowId: string) => any;
}

const SalvationsDataList = ({
  data,
  columns,
  toMobileRow,
  usePagination = true,
  initialRowsPerPage = 50,
  handleOpenModal,
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

                console.log(mobileRow);

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
                              ? it.label == 'Action' &&
                                it.render(handleOpenModal, row.id)
                              : ''}

                            {it.render && it.label !== 'Action'
                              ? it.render(row[it.name], row)
                              : row[it.name]}
                          </TableCell>
                        ))}
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
            rowsPerPageOptions={[10, 50, 100]}
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

export default SalvationsDataList;
