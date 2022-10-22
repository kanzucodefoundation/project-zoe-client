import React from 'react';
import { Link } from 'react-router-dom';
import { localRoutes } from '../data/constants';

interface IProps {
  id:number;
  name:string;
}

const SummaryLink = ({ name,id }: IProps) => (
  <Link style={{ textDecoration: 'none' }} to={`${localRoutes.summary}/${id}`}>
    {name}
  </Link>
);

export default SummaryLink;
