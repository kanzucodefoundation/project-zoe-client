import {
  Box,
  Divider,
  Grid,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Alert } from '@material-ui/lab';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { useHistory } from 'react-router';
import { remoteRoutes } from '../../../data/constants';
import { del, post, search } from '../../../utils/ajax';
import PersonAvatar from '../../../components/PersonAvatar';
import Toast from '../../../utils/Toast';

const MemberRequests = (props: any) => {
  const history = useHistory();
  const [data, setData] = useState<any[]>([]);
  const [isLocation, setIsLocation] = useState<boolean>(false);

  useEffect(() => {
    let filter = {};
    if (props.group.categoryId === 'Location') {
      setIsLocation(true);
      filter = { parentId: props.group.id };
    } else {
      filter = { groupId: props.group.id };
    }
    search(remoteRoutes.groupsRequest, filter, (resp) => {
      setData(resp);
    });
  }, [props.group.categoryId, props.group.id]);

  function handleApprove(dt: any) {
    const toSave = {
      groupId: props.group.id,
      members: [dt.contactId],
      role: 'Member',
    };
    post(`${remoteRoutes.groupsMembership}`, toSave, (resp) => {
      Toast.info('USER REQUEST APPROVED');
      del(`${remoteRoutes.groupsRequest}/${dt.id}`, (resp) => {
        setTimeout(() => history.go(0), 3000);
      });
    });
  }

  function handleDelete(dt: any) {
    del(`${remoteRoutes.groupsRequest}/${dt}`, (resp) => {
      Toast.info('User Request Denied');
      setTimeout(() => history.go(0), 3000);
    });
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box display="flex" flexDirection="column">
          <Divider />
          <Box>
            {data.length === 0 ? (
              <ListItem>
                <Alert severity="info" style={{ width: '100%' }}>
                  No Pending Memberships
                </Alert>
              </ListItem>
            ) : (
              data.map((mbr) => (
                  <ListItem key={mbr.id}>
                    <ListItemAvatar>
                      <PersonAvatar data={mbr.contact.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={mbr.contact.fullName}
                      secondary={isLocation ? `${mbr.group.name}` : null}
                    />
                    {isLocation ? null : (
                      <>
                        <IconButton
                          color="primary"
                          size="medium"
                          onClick={() => handleApprove(mbr)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          size="medium"
                          onClick={() => handleDelete(mbr.id)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItem>
              ))
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default MemberRequests;
