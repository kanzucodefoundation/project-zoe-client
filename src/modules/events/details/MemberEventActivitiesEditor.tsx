import {
  Chip,
  createStyles,
  Divider,
  Grid,
  Hidden,
  makeStyles,
  Theme,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { id } from 'date-fns/locale';
import EditDialog from '../../../components/EditDialog';
import Loading from '../../../components/Loading';
import { remoteRoutes } from '../../../data/constants';
import { get } from '../../../utils/ajax';

import { XHeadCell } from '../../../components/table/XTableHead';
import MemberEventActivitiesForm from './MemberEventActivitiesAssignForm';
import XTable from '../../../components/table/XTable';
import MemberEventActivitiesUnassign from './MemberEventActivitiesUnassign';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const headCells: XHeadCell[] = [
  {
    name: 'activity',
    label: 'ACTIVITY',
  },
  {
    name: 'members',
    label: 'MEMBER(S)',
    render: (members: string[]) => members.map((it: any, i: any) => (
        <Chip
          color="primary"
          variant="outlined"
          key={i}
          style={{ margin: 5, marginLeft: 0, marginTop: 0 }}
          size="small"
          label={it.person}
        />
    )),
  },
  {
    name: 'members',
    label: 'Unassign ',
    render: (members: string[], activityId: any) => (
      <MemberEventActivitiesUnassign members={members} activityId={id} />
    ),
  },
];

const MemberEventActivitiesEditor = () => {
  const classes = useStyles();
  const [createDialog, setCreateDialog] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);

  function handleNew() {
    setCreateDialog(true);
  }
  function closeCreateDialog() {
    setCreateDialog(false);
  }

  const handleItemClick = (id: number) => () => {};

  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.memberEventActivities}`,
      (data) => {
        console.log('data', data);
        setData(data);
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  }, [createDialog]);

  const createTitle = ' Assign Activity to Member(s)';
  return (
    <Box>
      <Box p={1} className={classes.root}>
        <Grid item xs={12}>
          <Box display="flex" pt={1} style={{ paddingBottom: 20 }}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNew}
                size="small"
              >
                Assign &nbsp;&nbsp;
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <EditDialog
            open={createDialog}
            onClose={closeCreateDialog}
            title={createTitle}
          >
            <MemberEventActivitiesForm
              data={{}}
              isNew={true}
              done={closeCreateDialog}
            />
          </EditDialog>
        </Grid>
        <Divider />
      </Box>
      <Box>
        <Hidden smDown>
          <Box pt={1}>
            {loading ? (
              <Loading />
            ) : (
              <XTable
                headCells={headCells}
                data={data}
                initialRowsPerPage={5}
                initialSortBy="name"
                handleSelection={handleItemClick}
              />
            )}
          </Box>
        </Hidden>
      </Box>
    </Box>
  );
};

export default MemberEventActivitiesEditor;
