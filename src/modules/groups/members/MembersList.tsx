import React, { useCallback, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { Alert } from '@material-ui/lab';
import { IGroupMembership } from '../types';
import { search } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import PersonAvatar from '../../../components/PersonAvatar';
import Loading from '../../../components/Loading';
import EditDialog from '../../../components/EditDialog';
import MembersEditor from './MembersEditor';
import MemberEditor from './MemberEditor';

interface IProps {
  groupId: number;
  isLeader: boolean;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  flexContent: {
    flex: 0,
    marginTop: 20,
  },
}));

const MembersList = ({ groupId, isLeader }: IProps) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [addingMembers, setAddingMembers] = useState<boolean>(false);
  const [selected, setSelected] = useState<IGroupMembership | null>(null);
  const [data, setData] = useState<IGroupMembership[]>([]);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    console.log('fetchMembers', data.length, groupId);
    search(
      remoteRoutes.groupsMembership,
      {
        groupId,
      },
      (respData) => {
        setData(respData);
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  function handleAddNew() {
    setAddingMembers(true);
  }

  function handleCloseDialog() {
    setAddingMembers(false);
  }

  const handleSelected = (mbr: IGroupMembership) => () => {
    setSelected(mbr);
  };

  const handleMemberEdited = (mbr: IGroupMembership) => {
    setSelected(null);
    const newData = data.map((it: any) => {
      if (it.id === mbr.id) return mbr;
      return it;
    });
    setData(newData);
  };

  const handleMemberDeleted = (mbr: IGroupMembership) => {
    setSelected(null);
    const newData = data.filter((it: any) => it.id !== mbr.id);
    setData(newData);
  };

  function handleQuerySearch(query: string) {
    const results = data.filter((p) => p.contact.name.toLowerCase().includes(query.toLowerCase()));
    if (results && query.length > 0) {
      setData(results);
    } else {
      fetchMembers();
    }
  }

  function handleDone() {
    fetchMembers();
    setAddingMembers(false);
  }

  if (loading) return <Loading />;

  return (
    <Grid container>
      <Grid item xs={12} md={6}>
        {data.length > 0 ? (
          <Box p={2}>
            <Typography variant="body2">
              Total number of members: <strong>{data.length}</strong>
            </Typography>
          </Box>
        ) : (
          ''
        )}
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          autoComplete="off"
          hiddenLabel
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="inherit" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => handleQuerySearch(e.target.value)}
          variant="outlined"
          size="small"
          name="query"
          placeholder="Search here ..."
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" pt={1} style={{ paddingBottom: 20 }}>
          <Box display="flex" justifyContent="flex-end">
            {isLeader ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                size="small"
              >
                Add Member(s)&nbsp;&nbsp;
              </Button>
            ) : null}
          </Box>
        </Box>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <List dense className={classes.root}>
          {data.length === 0 ? (
            <ListItem button onClick={handleAddNew}>
              <Alert severity="info" style={{ width: '100%' }}>
                No members click to add new
              </Alert>
            </ListItem>
          ) : (
            data.map((mbr, i) => (
              <ListItem
                key={mbr.id}
                button
                onClick={handleSelected(mbr)}
                alignItems="flex-start"
              >
                <ListItemText primary={i + 1} className={classes.flexContent} />
                <ListItemAvatar style={{ marginLeft: 30 }}>
                  <PersonAvatar data={mbr.contact} />
                </ListItemAvatar>
                <ListItemText
                  primary={mbr.contact.name}
                  secondary={`Role: ${mbr.role}`}
                />
              </ListItem>
            ))
          )}
        </List>
      </Grid>

      <EditDialog
        open={addingMembers}
        onClose={handleCloseDialog}
        title="MembersEditor"
        maxWidth="sm"
      >
        <MembersEditor group={{ id: groupId }} done={handleDone} />
      </EditDialog>

      {isLeader ? (
        <EditDialog
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          title={`Edit ${selected?.contact.name}`}
          maxWidth="lg"
        >
          <MemberEditor
            data={selected}
            onDeleted={handleMemberDeleted}
            done={handleMemberEdited}
          />
        </EditDialog>
      ) : null}
    </Grid>
  );
};

export default MembersList;
