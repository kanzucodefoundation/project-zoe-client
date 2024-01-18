import React, { useEffect, useState } from 'react';
import { Button, createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import AddIcon from '@material-ui/icons/Add';
import { useDispatch, useSelector } from 'react-redux';
import { XHeadCell } from '../../../components/table/XTableHead';
import { appPermissions, remoteRoutes } from '../../../data/constants';
import ListHeader from '../../../components/ListHeader';
import XTable from '../../../components/table/XTable';
import EditDialog from '../../../components/EditDialog';
import Loading from '../../../components/Loading';
import NewReportCategories from './NewGroupCategories';
import EventsFilter from '../../events/EventsFilter';
import { eventsFetchAsync } from '../../../data/events/eventsReducer';
import { hasAnyRole } from '../../../data/appRoles';
import { IState } from '../../../data/types';
import EditGroupCategories from './editGroupCategories';
import { get } from '../../../utils/ajax';
import Navigation from '../../../components/layout/Layout';

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
  { name: 'name', label: 'Category Name' },
  {
    name: '_id',
    label: '',
    render: (value, rec) => <EditGroupCategories value={rec} />,
  },
];

const ReportCategories = () => {
  const dispatch = useDispatch();
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
    dispatch(eventsFetchAsync(filter));
  }, [filter, dispatch]);

  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.groupsCategories}`,
      (data) => {
        setData(data);
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  }, [createDialog]);

  const createTitle = 'Group Categories';
  return (
    <Navigation>
      <Box>
        <Box p={1} className={classes.root}>
          <ListHeader
            title="Group Categories"
            onFilter={setFilter}
            filterComponent={<EventsFilter onFilter={setFilter} />}
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
