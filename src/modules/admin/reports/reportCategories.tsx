import React, { useEffect, useState } from 'react';
import { Button, createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import AddIcon from '@material-ui/icons/Add';
import { useSelector } from 'react-redux';
import { XHeadCell } from '../../../components/table/XTableHead';
import { appPermissions, remoteRoutes } from '../../../data/constants';
import ListHeader from '../../../components/ListHeader';
import XTable from '../../../components/table/XTable';
import EditDialog from '../../../components/EditDialog';
import Loading from '../../../components/Loading';
import NewReportCategories from './NewReportCategories';
import { hasAnyRole } from '../../../data/appRoles';
import { IState } from '../../../data/types';
import EditReportCategories from './EditReportCategories';
import { get } from '../../../utils/ajax';
import Navigation from '../../../components/layout/Layout';
import ReportFieldsFilter from './ReportFieldsFilter';
import { hasValue } from '../../../components/inputs/sutils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    filterPaper: {
      borderRadius: 0,
      padding: theme.spacing(2),
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  }),
);

const headCells: XHeadCell[] = [
  {
    name: 'name',
    label: 'Name',
  },
  { name: 'label', label: 'Label' },
  { name: 'type', label: 'Type' },
  {
    name: 'isRequired',
    label: 'isRequired',
    render: (value) => `${value}`,
  },
  { name: 'categoryId', label: 'CategoryId' },
  {
    name: 'id',
    label: '',
    render: (value, rec) => <EditReportCategories value={rec} />,
  },
];

const ReportCategories = () => {
  const [createDialog, setCreateDialog] = useState(false);

  const classes = useStyles();
  const [data, setData] = useState<any[]>([]);

  const user = useSelector((state: IState) => state.core.user);
  const [filter, setFilter] = useState<any>({ limit: 5000 });

  const [loading, setLoading] = useState<boolean>(false);

  function handleNew() {
    setCreateDialog(true);
  }

  const handleItemClick = (id: number) => () => {};

  function closeCreateDialog() {
    setCreateDialog(false);
  }

  useEffect(() => {
    setLoading(true);
    const RemoteUrl = hasValue(filter.categoryId)
      ? `${remoteRoutes.eventsField}/?category=${filter.categoryId}`
      : `${remoteRoutes.eventsField}`;

    get(
      RemoteUrl,
      (ajdata) => {
        setData(ajdata);
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  }, [createDialog, filter]);

  const createTitle = 'Report fields';
  return (
    <Navigation>
      <Box>
        <Box p={1} className={classes.root}>
          <ListHeader
            title="ReportCategories"
            onFilter={setFilter}
            filterComponent={<ReportFieldsFilter onFilter={setFilter} />}
            loading={loading}
            buttons={
              <>
                {hasAnyRole(user, [appPermissions.roleEventEdit]) && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleNew}
                    style={{ marginLeft: 8 }}
                  >
                    Add new&nbsp;&nbsp;
                  </Button>
                )}
              </>
            }
            filter={undefined}
          />
          <Hidden smDown>
            <Box pt={1}>
              {loading ? (
                <Loading />
              ) : (
                <XTable
                  headCells={headCells}
                  data={data}
                  initialRowsPerPage={10}
                  initialSortBy="name"
                  handleSelection={handleItemClick}
                />
              )}
            </Box>
          </Hidden>
        </Box>
        <EditDialog
          title={createTitle}
          open={createDialog}
          onClose={closeCreateDialog}
        >
          <NewReportCategories
            data={{}}
            isNew={true}
            done={closeCreateDialog}
          />
        </EditDialog>
      </Box>
    </Navigation>
  );
};

export default ReportCategories;
