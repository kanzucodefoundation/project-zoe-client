import React from 'react';
import { Link } from 'react-router-dom';
import { localRoutes } from '../data/constants';
import { EditiIcon } from '../components/EditIconButton';

interface IProps {
  id: string;
  name:string;
}

const IconLink = ({ id,name }: IProps) => (
  <Link style={{ textDecoration: 'none' }} to={`${localRoutes.contacts}/${id}`}>
    <EditiIcon/>
  </Link>
);

export default IconLink;
