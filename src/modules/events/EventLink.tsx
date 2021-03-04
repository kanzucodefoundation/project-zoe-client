import React from "react";
import { Link } from "react-router-dom";
import { localRoutes } from "../../data/constants";

interface IProps {
  id: string;
  name: string;
}

const EventLink = ({ id, name }: IProps) => (
  <Link style={{ textDecoration: "none" }} to={`${localRoutes.events}/${id}`}>
    {name}
  </Link>
);

export default EventLink;
