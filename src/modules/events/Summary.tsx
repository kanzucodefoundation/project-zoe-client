import React, { Fragment, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import XTable from '../../components/table/XTable';
import { XHeadCell } from '../../components/table/XTableHead';
import { appPermissions, localRoutes } from '../../data/constants';
import Loading from '../../components/Loading';
import EditDialog from '../../components/EditDialog';
import { IMobileRow } from '../../components/DataList';
import { hasValue } from '../../components/inputs/inputHelpers';
import { printDate, printDateTime } from '../../utils/dateHelpers';
import PersonAvatar from '../../components/PersonAvatar';
import { hasAnyRole } from '../../data/appRoles';
import { IState } from '../../data/types';
import ListHeader from '../../components/ListHeader';
import EventsFilter from './EventsFilter';
import EventForm from './forms/EventForm';
import EventLink from './EventLink';
import { IEvent } from './types';
import { eventsFetchAsync, IEventState } from '../../data/events/eventsReducer';
import EventRegisterButton from './EventRegister';
import Navigation from '../../components/layout/Layout';
import IconLink from '../../components/IconLink';

const useStyles = makeStyles((theme: Theme) => createStyles({
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
}));


const summaryItems = [
  {
      "location": "WHNaalya",
      "2oct2022": "1396",
      "9oct2022": "1547",
      "16oct2022": "1527",
      "average": "1490"
    },
    {
      "location": "WHKBD",
      "2oct2022": "333",
      "9oct2022": "1233",
      "16oct2022": "344",
      "average": "122"
    },
    {
      "location": "WHDTN",
      "2oct2022": "3444",
      "9oct2022": "1222",
      "16oct2022": "4444",
      "average": "223"
    },
    {
      "location": "WHNaalya",
      "2oct2022": "1396",
      "9oct2022": "1547",
      "16oct2022": "1527",
      "average": "1490"
    },
    {
      "location": "WHKBD",
      "2oct2022": "333",
      "9oct2022": "1233",
      "16oct2022": "344",
      "average": "122"
    },
    {
      "location": "WHDTN",
      "2oct2022": "3444",
      "9oct2022": "1222",
      "16oct2022": "4444",
      "average": "223"
    },
    {
      "location": "WHNaalya",
      "2oct2022": "1396",
      "9oct2022": "1547",
      "16oct2022": "1527",
      "average": "1490"
    },
    {
      "location": "WHKBD",
      "2oct2022": "333",
      "9oct2022": "1233",
      "16oct2022": "344",
      "average": "122"
    },
    {
      "location": "WHDTN",
      "2oct2022": "3444",
      "9oct2022": "1222",
      "16oct2022": "4444",
      "average": "223"
    }
]

const headCells: XHeadCell[] = [
  {
    name: 'location.name',
    label: 'Location',
  },
  {
    name: '2oct2022.name',
    label: '2 October 2022',
  },
  {
    name: '9oct2022.name',
    label: '9 October 2022',
  },
  //  {
  //   name: '16oct2022.name',
  //   label: 'Redirect Hits',
  // },
   {
    name: 'average.name',
    label: 'Average',
  },
  {
    name: 'average.name',
    label: '',
  },
];

const toMobileRow = (data: IEvent): IMobileRow => ({
  avatar: <PersonAvatar data={data} />,
  primary: data.name,
  secondary: (
      <>
        <Typography variant="caption" color="textSecondary" display="block">
          Group: {data.group.name}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          {data.category.name}: {printDateTime(data.startDate)}
        </Typography>
        <EventRegisterButton id={data.id} />
      </>
  ),
});

const Summary = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showDialog, setShowDialog] = useState(false);
  const { data, loading }: IEventState = useSelector(
    (state: any) => state.events,
  );
  const [filter, setFilter] = useState<any>({ limit: 5000 });
  const user = useSelector((state: IState) => state.core.user);
  const classes = useStyles();

  useEffect(() => {
    dispatch(eventsFetchAsync(filter));
  }, [filter, dispatch]);

  function handleNew() {
    setShowDialog(true);
    dispatch(eventsFetchAsync(filter));
  }
  const handleRowClick = (id: string) => {
    history.push(`${localRoutes.events}/${id}`);
  };

  const handleItemClick = (id: string) => () => {
    handleRowClick(id);
  };

  function closeCreateDialog() {
    setShowDialog(false);
    dispatch(eventsFetchAsync(filter));
  }

  function handleClose() {
    setShowDialog(false);
  }

  const createTitle = 'New Event';
  return (
    <Navigation>
      <Box p={1} className={classes.root}>
        <ListHeader
          title="Submitted Group Reports"
          onFilter={setFilter}
          filter={filter}
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
                handleSelection={handleRowClick}
              />
            )}
          </Box>
        </Hidden>
        <Hidden mdUp>
          <List>
            {loading ? (
              <Loading />
            ) : (
              data.map((row: any) => {
                const mobileRow = toMobileRow(row);
                return (
                  <Fragment key={row.id}>
                    <ListItem
                      alignItems="flex-start"
                      button
                      disableGutters
                      onClick={handleItemClick(row.id)}
                    >
                      <ListItemAvatar>{mobileRow.avatar}</ListItemAvatar>
                      <ListItemText
                        primary={mobileRow.primary}
                        secondary={mobileRow.secondary}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </Fragment>
                );
              })
            )}
          </List>
          {hasAnyRole(user, [appPermissions.roleEventEdit]) ? (
            <Fab
              aria-label="add-new"
              className={classes.fab}
              color="primary"
              onClick={handleNew}
            >
              <AddIcon />
            </Fab>
          ) : null}
        </Hidden>
      </Box>
      <EditDialog
        title={createTitle}
        open={showDialog}
        onClose={closeCreateDialog}
      >
        <EventForm
          data={{}}
          isNew={true}
          onCreated={closeCreateDialog}
          onCancel={handleClose}
        />
      </EditDialog>
    </Navigation>
  );
};

export default Summary;
