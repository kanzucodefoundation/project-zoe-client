import React from 'react';
import { Avatar } from '@material-ui/core';

interface IProps {
  value: string;
}

const isUrl = (str: string) => {
  try {
    return Boolean(new URL(str));
  } catch (e) {
    return false;
  }
};

const XAvatar = ({ value }: IProps) => (isUrl(value) ? (
    <Avatar alt="Avatar" src={value} />
) : (
    <Avatar>{value[0]}</Avatar>
));

export default XAvatar;
