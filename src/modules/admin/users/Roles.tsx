import { Box, Chip, Divider, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ListHeader from "../../../components/ListHeader";
import { hasRole } from "../../../data/appRoles";
import { remoteRoutes, appPermissions } from "../../../data/constants";
import { IState } from "../../../data/types";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import { XHeadCell } from "../../../components/table/XTableHead";
import DataList from "../../../components/DataList";
import Loading from "../../../components/Loading";
import { useHistory } from "react-router";
import { search } from "../../../utils/ajax";
import { IRoles } from "./types";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../../components/EditDialog";
import RolesEditor from "./RolesEditor";
import { AddFabButton } from "../../../components/EditIconButton";

const columns: XHeadCell[] = [
  {
    name: "isActive",
    label: "Status",
    render: (value) => (
      <Chip
        label={value ? "Active" : "Inactive"}
        color={value ? "secondary" : "default"}
        size="small"
      />
    ),
  },
  {
    name: "role",
    label: "Role",
  },
  {
    name: "description",
    label: "Description",
  },
  {
    name: "permissions",
    label: "Permissions",
    render: (permissions: string[]) =>
      permissions?.map((it) => (
        <Chip
          color="primary"
          variant="outlined"
          key={it}
          style={{ margin: 5, marginLeft: 0, marginTop: 0 }}
          size="small"
          label={it}
        />
      )),
  },
];

// Mobile View
interface IMobileRow {
  avatar?: any;
  primary: any;
  secondary: any;
}

const toMobile = (data: any): IMobileRow => {
  return {
    primary: (
      <>
        {"Status: "}
        <Chip
          label={data.isActive ? "Active" : "Inactive"}
          color={data.isActive ? "secondary" : "default"}
          size="small"
        />
        <Box pt={0.5}>
          <Typography
            variant="subtitle2"
            color="textPrimary"
          >{`Role: ${data.role}`}</Typography>
        </Box>

        <Box pt={0.5}>
          <Typography variant="caption" color="textSecondary">
            {`Description: ${data.description}`}
          </Typography>
        </Box>
      </>
    ),
    secondary: (
      <Box pt={0.5}>
        <Typography variant="caption" color="textSecondary">
          {data.username}
        </Typography>
        <Box pt={0.5}>
          {data.permissions?.map((it: any) => (
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

const Roles = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const user = useSelector((state: IState) => state.core.user);
  const [dialog, setDialog] = useState<boolean>(false);
  const [filter, setFilter] = useState<any>({ limit: 100 });

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.roles,
      filter,
      (resp: IRoles[]) => {
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
    const { id, role, description, permissions, isActive } = dt;
    const toEdit = {
      id,
      role,
      description,
      permissions: [...permissions],
      isActive: isActive,
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

  function handleDeleted(dt: any) {
    const newData = data.filter((it: any) => it.id !== dt.id);
    setData(newData);
    handleClose();
  }

  const canEditRoles = hasRole(user, appPermissions.roleEdit);
  return (
    <>
      <Box mb={1}>
        <ListHeader
          title="Manage User Roles"
          onFilter={handleFilter}
          filter={filter}
          loading={loading}
          buttons={
            <>
              {canEditRoles && (
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
            onEditClick={canEditRoles ? handleEdit : undefined}
          />
        )}
      </Box>
      {canEditRoles && (
        <Hidden mdUp>
          <AddFabButton onClick={handleNew} />
        </Hidden>
      )}
      {canEditRoles && (
        <EditDialog
          title={selected ? `Edit ${selected.role}` : "Create Role"}
          open={dialog}
          onClose={handleClose}
        >
          <RolesEditor
            data={selected}
            isNew={!selected}
            done={handleComplete}
            onDeleted={handleDeleted}
            onCancel={handleClose}
          />
        </EditDialog>
      )}
    </>
  );
};

export default Roles;
