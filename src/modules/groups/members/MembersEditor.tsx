import React, { useCallback, useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import red from '@material-ui/core/colors/red';
import Button from '@material-ui/core/Button';
import XSearchInput from '../../../components/inputs/XSearchInput';
import { IPersonComboValue } from '../../contacts/types';
import PersonAvatar from '../../../components/PersonAvatar';
import { remoteRoutes } from '../../../data/constants';
import { post, search } from '../../../utils/ajax';
import { hasNoValue } from '../../../components/inputs/sutils';
import { GroupRole, ICreateBatchMembership, IGroupMembership } from '../types';
import Toast from '../../../utils/Toast';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      minHeight: 300,
      backgroundColor: theme.palette.background.paper,
    },
    details: {
      minHeight: 100,
      borderRadius: 5,
      border: '1px solid',
      backgroundColor: grey[50],
      padding: theme.spacing(2),
    },
    selBox: {
      width: 70,
      position: 'relative',
    },
    closeIcon: {
      position: 'absolute',
      zIndex: 200,
    },
  }),
);

interface IProps {
  group: any;
  done: () => any;
}

const MembersEditor = (props: IProps) => {
  const classes = useStyles();
  const [fetchingPeople, setFetchingPeople] = useState<boolean>(true);
  const [addingMembers, setAddingMembers] = useState<boolean>(false);
  const [fetchingMembers, setFetchingMembers] = useState<boolean>(true);
  const [selected, setSelected] = useState<IPersonComboValue[]>([]);
  const [selectedIdList, setSelectedIdList] = useState<string[]>([]);
  const [peopleData, setPeopleData] = useState<IPersonComboValue[]>([]);
  const [membership, setMembership] = useState<IGroupMembership[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = useCallback((query: string) => {
    setFetchingPeople(true);
    search(
      remoteRoutes.contactsPeopleCombo,
      {
        searchQuery: query,
      },
      (data) => {
        setPeopleData(data);
      },
      undefined,
      () => {
        setFetchingPeople(false);
      },
    );
  }, []);

  useEffect(() => {
    setFetchingMembers(true);
    search(
      remoteRoutes.groupsMembership,
      {
        groupId: props.group.id,
      },
      (data) => {
        setMembership(data);
      },
      undefined,
      () => {
        setFetchingMembers(false);
      },
    );
  }, [props.group.id]);

  useEffect(() => {
    fetchData(searchQuery);
  }, [fetchData, searchQuery]);

  const isAlreadyAdded = (psn: IPersonComboValue): boolean => {
    const mbr = membership.find((it) => it.contactId === psn.id);
    return !!mbr || selectedIdList.indexOf(psn.id) > -1;
  };

  function handleSearch(v: string) {
    setSearchQuery(v);
  }

  const handleAddNew = (dt: IPersonComboValue) => () => {
    if (!isAlreadyAdded(dt)) {
      setSelected([...selected, dt]);
      setSelectedIdList([...selectedIdList, dt.id]);
    }
  };

  const handleDelete = (id: string) => () => {
    setSelected([...selected.filter((it) => it.id !== id)]);
    setSelectedIdList([...selectedIdList.filter((it) => it !== id)]);
  };

  function handleAddMembers() {
    const toSave: ICreateBatchMembership = {
      groupId: props.group.id,
      members: selectedIdList,
      role: GroupRole.Member,
    };
    setAddingMembers(true);
    post(remoteRoutes.groupsMembership, toSave, (resp) => {
      Toast.success(`${resp?.inserted} Members Added`);
      props.done();
    });
  }

  const isLoading = fetchingPeople || fetchingMembers || addingMembers;
  return (
    <Grid container>
      <Grid item xs={12}>
        <Box display="flex" pt={1} pb={1} width="100%">
          <XSearchInput onChange={handleSearch} disable={isLoading} />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box width="100%" display="flex">
          <Box flexGrow={1} mr={3}>
            <Box className={classes.details} width="100%" display="flex">
              {selected.map((it) => (
                <Box className={classes.selBox} mr={1} key={it.id}>
                  <Box
                    width="100%"
                    display="flex"
                    justifyContent="flex-end"
                    pr={1}
                  >
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={handleDelete(it.id)}
                      className={classes.closeIcon}
                    >
                      <CloseIcon
                        style={{ fontSize: '0.9rem', color: red[900] }}
                      />
                    </IconButton>
                  </Box>

                  <Box width="100%" display="flex" pl={1}>
                    <PersonAvatar data={it} />
                  </Box>
                  <Typography noWrap variant="body2">
                    {it.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box pt={2}>
            <Button
              disabled={hasNoValue(selectedIdList) || isLoading}
              startIcon={<AddIcon />}
              color="primary"
              variant="contained"
              size="large"
              onClick={handleAddMembers}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <List dense className={classes.root}>
          {peopleData.map((person) => (
            <ListItem
              disabled={isAlreadyAdded(person) || isLoading}
              key={person.id}
              button
              onClick={handleAddNew(person)}
            >
              <ListItemAvatar>
                <PersonAvatar data={person} />
              </ListItemAvatar>
              <ListItemText
                primary={person.name}
                secondary={isAlreadyAdded(person) ? <i>Already added</i> : ''}
              />
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
};

export default MembersEditor;
