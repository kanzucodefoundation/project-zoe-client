import { makeStyles, Theme, createStyles, Typography } from "@material-ui/core";
import React from "react";
import { IMobileRow } from "../../components/DataList";
import GroupLink from "../../components/GroupLink";
import { hasValue } from "../../components/inputs/inputHelpers";
import { XHeadCell } from "../../components/table/XTableHead";
import { printDate } from "../../utils/dateHelpers";
import ReportLink from "./ReportLink";
import { IReport } from "./types";
import DescriptionIcon from '@material-ui/icons/Description';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    filterPaper: {
      borderRadius: 0,
      padding: theme.spacing(2)
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2)
    }
  })
);

const headCells: XHeadCell[] = [
  {
    name: "id",
    label: "Name",
    render: (value, rec) => <ReportLink id={value} name={rec.name} />
  },
  { name: "category.name", label: "Category" },
  { name: "startDate", label: "Date", render: printDate },
  {
    name: "group",
    label: "Group",
    render: value =>
      hasValue(value) ? <GroupLink id={value.id} name={value.name} /> : "-na-"
  }
];

const toMobileRow = (data: IReport): IMobileRow => {
  return {
    avatar: <DescriptionIcon fontSize="large"/>,
    primary: data.name,
    secondary: (
      <>
        <Typography variant="caption" color="textSecondary">
          {data.category.name}: {printDate(data.date)}
        </Typography>
      </>
    )
  };
};



const ReportsList = () => {
    return (
        <div>
            
        </div>
    );

};

export default ReportsList;
