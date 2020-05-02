import React from "react";
import { Box } from "@material-ui/core";
import { remoteRoutes } from "../../data/constants";

import Navigation from "../../components/layout/Layout";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Header from "./Header";

import MaterialTable, { Column } from "material-table";

interface IProps {
  data: any | null;
  done?: () => any;
}

interface Row {
  ministry: string;
  taskName: string;
  taskDescription: string;
}

interface TableState {
  columns: Array<Column<Row>>;
  data: Row[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    filterPaper: {
      borderRadius: 0,
      padding: theme.spacing(2),
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

const ListOfTasks = ({ done }: IProps) => {
  const classes = useStyles();

  // For displaying the table data
  const [state, setData] = React.useState<TableState>({
    columns: [
      { title: "Ministry", field: "ministry" },
      { title: "Taskname", field: "taskName" },
      { title: "Taskdescription", field: "taskDescription" },
    ],
    data: [],
  });

  React.useEffect(() => {
    async function fetchTasks() {
      const res = await fetch(remoteRoutes.tasks);
      const json = await res.json();
      console.log(json);
      setData({
        ...state,
        data: json,
      });
    }
    fetchTasks();
  }, []);

  return (
    <Navigation>
      <Box p={1} className={classes.root}>
        <Header title="View tasks" />
        <MaterialTable
          title="Tasks"
          columns={state.columns}
          data={state.data}
        />
      </Box>
    </Navigation>
  );
};

export default ListOfTasks;
