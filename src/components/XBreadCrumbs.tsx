import React from "react";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { Breadcrumbs, Link } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@material-ui/core/Typography";

interface IProps {
  paths: MyPath[];
  title: string;
}

type MyPath = {
  path: string;
  label: string;
};

const XBreadCrumbs = ({ paths, title }: IProps) => {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      {paths.map((it) => (
        <Link
          variant="body1"
          color="inherit"
          to={it.path}
          component={RouterLink}
          key={it.path}
        >
          {it.label}
        </Link>
      ))}
      <Typography variant="body1" color="textPrimary">
        {title}
      </Typography>
    </Breadcrumbs>
  );
};

export default XBreadCrumbs;
