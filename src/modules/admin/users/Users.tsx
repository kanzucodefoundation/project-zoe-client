import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { XHeadCell } from "../../../components/table/XTableHead";
import { Avatar } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import DataList from "../../../components/DataList";
import { AddFabButton } from "../../../components/EditIconButton";
import { search } from "../../../utils/ajax";
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from "../../../data/constants";
import { hasValue } from "../../../components/inputs/inputHelpers";
import PersonIcon from "@material-ui/icons/Person";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../../components/EditDialog";
import UserEditor from "./UserEditor";
import Loading from "../../../components/Loading";
import Chip from "@material-ui/core/Chip";
import ListHeader from "../../../components/ListHeader";
import { hasAnyRole } from "../../../data/appRoles";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import { useSelector } from "react-redux";
import { IState } from "../../../data/types";
import Divider from "@material-ui/core/Divider";
import Layout from "../../../components/layout/Layout";

const columns: XHeadCell[] = [
  {
    name: "isActive",
    label: "Status",
    render: (value) => (
      <Chip
        label={value ? "Active" : "Inactive"}
        color="secondary"
        size="small"
      />
    ),
  },
  {
    name: "avatar",
    label: "Avatar",
    render: (data) => {
      const hasAvatar = hasValue(data);
      return hasAvatar ? (
        <Avatar alt="Avatar" src={data} />
      ) : (
        <Avatar>
          <PersonIcon />
        </Avatar>
      );
    },
    cellProps: {
      width: 50,
    },
  },
  {
    name: "username",
    label: "Username",
  },
  {
    name: "fullName",
    label: "Full Name",
    cellProps: {
      component: "th",
      scope: "row",
    },
  },
  {
    name: "roles",
    label: "Roles",
    render: (roles: string[]) =>
      roles?.map((it) => (
        <Chip
          color={it.includes(": is disabled") ? "default" : "primary"}
          variant="outlined"
          key={it}
          style={{ margin: 5, marginLeft: 0, marginTop: 0 }}
          size="small"
          label={it}
        />
      )),
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
      <Avatar alt="Avatar" src={data.avatar} />
    ) : (
      <>
        <Avatar>
          <PersonIcon />
        </Avatar>
        <Box>{`${data.fullName}\t`}</Box>
      </>
    ),
    primary: (
      <>
        <Chip
          label={data.isActive ? "Active" : "Inactive"}
          color={data.isActive ? "secondary" : "default"}
          size="small"
        />
      </>
    ),
    secondary: (
      <Box pt={0.5}>
        <Typography variant="caption" color="textSecondary">
          {data.fullName}
        </Typography>
        <Box pt={0.5}>
          {data.roles?.map((it: any) => (
            <Chip
              color="primary"
              variant="outlined"
              key={it}
              style={{ margin: 5, marginLeft: 0, marginTop: 0 }}
              size="small"
              label={it}
            />
          ))}
        </Box>
      </Box>
    ),
  };
};

const Users = () => {
  const history = useHistory();
  const [filter, setFilter] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [dialog, setDialog] = useState<boolean>(false);
  const user = useSelector((state: IState) => state.core.user);
  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.users,
      filter,
      (resp) => {
        setData(resp);
      },
      undefined,
      () => setLoading(false)
    );
  }, [filter]);

  function handleFilter(value: any) {
    setFilter({ ...filter, ...value });
  }

  function handleNew() {
    setSelected(null);
    setDialog(true);
  }

  const handleEdit = (dt: any) => {
    const { id, username, contactId, fullName, roles, isActive } = dt;
    const toEdit = {
      id,
      username,
      roles: [...roles],
      contact: { id: contactId, label: fullName },
      isActive: isActive,
    };
    setSelected(toEdit);
    setDialog(true);
  };

  const handleView = (dt: any) => {
    history.push(`${localRoutes.contacts}/${dt.id}`);
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
    // setSelected(null);
    setDialog(false);
  };

  function handleDeleted(dt: any) {
    const newData = data.filter((it: any) => it.id !== dt.id);
    setData(newData);
    handleClose();
  }

  const canEditUsers = hasAnyRole(user, [appPermissions.roleUserEdit]);
  const canViewUsers = hasAnyRole(user, [appPermissions.roleUserView]);

  return (
    <Layout>
      <Box mb={1}>
        <ListHeader
          title="Users"
          onFilter={handleFilter}
          filter={filter}
          loading={loading}
          buttons={
            <>
              {canEditUsers && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleNew}
                  style={{ marginLeft: 8 }}
                >
                  Add new&nbsp;&nbsp;
                </Button>
              )}
            </>
          }
        />
      </Box>
      <Box pt={1}>
        <Divider />
        {loading ? (
          <Loading />
        ) : (
          <DataList
            data={data}
            toMobileRow={toMobile}
            columns={columns}
            onEditClick={canEditUsers ? handleEdit : undefined}
            onViewClick={canViewUsers ? handleView : undefined}
          />
        )}
      </Box>
      {canEditUsers && (
        <Hidden mdUp>
          <AddFabButton onClick={handleNew} />
        </Hidden>
      )}
      {canEditUsers && (
        <EditDialog
          title={selected ? `Edit ${selected.username}` : "Create User"}
          open={dialog}
          onClose={handleClose}
        >
          <UserEditor
            data={selected}
            isNew={!selected}
            done={handleComplete}
            onDeleted={handleDeleted}
            onCancel={handleClose}
          />
        </EditDialog>
      )}
    </Layout>
  );
};

export default Users;
