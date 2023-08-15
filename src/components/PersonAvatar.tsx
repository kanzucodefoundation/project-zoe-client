import React from 'react';
import PersonIcon from '@material-ui/icons/Person';
import { Avatar } from '@material-ui/core';
import { hasValue } from './inputs/sutils';

interface IProps {
  data: any;
}

const PersonAvatar = ({ data }: IProps) => (hasValue(data.avatar) ? (
    <Avatar alt="Avatar" src={data.avatar} />
) : (
    <Avatar>
      <PersonIcon />
    </Avatar>
));

export default PersonAvatar;
