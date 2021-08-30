import { Typography } from '@material-ui/core';
import { Box, Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { hasNoValue } from '../../components/inputs/inputHelpers';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { get, post } from '../../utils/ajax';
import Toast from '../../utils/Toast';

interface IProps {
  id: string;
}

const EventRegisterButton = ({ id }: IProps) => {
  //Getting contactId of loggedIn User
  const user = useSelector((state: IState) => state.core.user);

  const [loading, setLoading] = useState<boolean>(false);
  const [register, setRegister] = useState<boolean>(false);

  //Function to handle submissions
  const handleSubmit = () => {
    const toSave = {
      contactId: user.contactId,
      eventId: id,
    };

    post(remoteRoutes.eventsRegistration, toSave, () => {
      Toast.success('Event registration is successful');
    });
  };

  //Fetch data
  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.eventsRegistration}/?contactId=${user.contactId}`,
      (data) => {
        for (let i = 0; i < data.length; i++) {
          //check if the event was already registered to
          if (data[i].event.id === id) {
            setRegister(data[i].event.id);
          }
        }
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }, [user.contactId]);
  return hasNoValue(register) ? (
    <Box display="flex">
      <Box pr={1}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSubmit}
        >
          Register &nbsp;&nbsp;
        </Button>
      </Box>
    </Box>
  ) : (
    <Typography> Registered</Typography>
  );
};
export default EventRegisterButton;
