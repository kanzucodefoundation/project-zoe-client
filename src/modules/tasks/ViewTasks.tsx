import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { XHeadCell } from "../../components/table/XTableHead";
import { Avatar } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Header from "./Header";
import DataList from "../../components/DataList";
import { AddFabButton } from "../../components/EditIconButton";
import { search } from "../../utils/ajax";
import { remoteRoutes } from "../../data/constants";
import { hasValue } from "../../components/inputs/inputHelpers";
import PeopleIcon from "@material-ui/icons/People";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../components/EditDialog";
import TaskEditor from "./TaskEditor";
import { ICreateTaskDto } from "./Types";
import Loading from "../../components/Loading";
import { FormikHelpers } from "formik"
const columns: XHeadCell[] = [
  
  {
    name: "id",
    label: "ID",
  },
  {
    name: "ministry",
    label: "Ministry",
  },
  {
    name: "taskName",
    label: "Task Name",
  },

  {
    name: "taskDescription",
    label: "Task Description",
  },
  {
    name: "status",
    label: "Status",
  },
];

interface IMobileRow {
  avatar: any;
  primary: any;
  secondary: any;
}

const toMobile = (data: any): IMobileRow => {
  const hasAvatar = hasValue(data.avatar);
  return {
    avatar: hasAvatar ? (
      <Avatar alt="Avatar" src={data.person.avatar} />
    ) : (
        <Avatar>
          <PeopleIcon />
        </Avatar>
      ),
    primary: data.ministry,
    secondary: (
      <>
        <Typography variant="caption" color="textSecondary" display="block">
          {data.taskName}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {data.taskDescription}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {data.status}
        </Typography>
      </>
    ),
  };
};

const Tasks = () => {
  const [filter, setFilter] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [dialog, setDialog] = useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.tasks,
      filter,
      (resp) => {
        setData(resp);
      },
      undefined,
      () => setLoading(false)
    );
  }, [filter]);

  function handleFilter(query: string) {
    setFilter({ query });
  }

  function handleNew() {
    setSelected(null);
    setDialog(true);
  }

  const handleEdit = (dt: any) => {
    const { id, ministry, taskName, taskDescription, status } = dt;
    const toEdit = {
      id,
      ministry,
      taskName,
      taskDescription,
      status
    };
    setSelected(toEdit);
    setDialog(true);
  };

  const handleComplete = (dt: any) => {
    if (selected) {
      const newData = data.map((it: any) => {
        if (it.id === dt.id) return dt;
        else return it;
      });
      setData(newData);
    } else {
      const newData = [...data, dt];
      setData(newData);
    }
    handleClose();
  };
  const handleClose = () => {
    setSelected(null);
    setDialog(false);
  };
  
  return (
    <Layout>
      <Box p={2}>
        
        {loading ? (
          <Loading />
        ) : (
          
            <DataList
              data={data}
              toMobileRow={toMobile}
              columns={columns}
              onEditClick={handleEdit}
            />
          )}
      </Box>
      <Hidden mdUp>
        <AddFabButton onClick={handleNew} />
      </Hidden>
      <EditDialog
        title={selected ? "Edit Task" : "Create Task"}
        open={dialog}
        onClose={handleClose}
      >
        <TaskEditor data={selected} isNew={!selected} done={handleComplete} />
      </EditDialog>
    </Layout>
  );
};

export default Tasks;
