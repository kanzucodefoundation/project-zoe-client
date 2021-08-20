import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import GroupsList from "./GroupsList";
import TabbedView from "./TabbedView";
import { Typography } from "@material-ui/core";
import { IGroup } from "./types";
import { useSelector } from "react-redux";
import { IState } from "../../data/types";
import { search } from "../../utils/ajax";
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from "../../data/constants";
import { useHistory } from "react-router";
import EditDialog from "../../components/EditDialog";
import GroupEditor from "./editors/GroupEditor";
import Box from "@material-ui/core/Box";
import { hasAnyRole } from "../../data/appRoles";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import ListHeader from "../../components/ListHeader";

const GroupTabView = () => {
  const [filter, setFilter] = useState<any>({});
  const [selected, setSelected] = useState<IGroup | null>(null);
  const [data, setData] = useState<IGroup[]>([]);
  const user = useSelector((state: IState) => state.core.user);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialog, setDialog] = useState<boolean>(false);
  const history = useHistory();
  function handleClose() {
    setDialog(false);
  }

  function handleNew() {
    setSelected(null);
    setDialog(true);
  }

  function handleAddUnder(dt: any) {
    setSelected(dt);
    setDialog(true);
  }

  function handleAdded(dt: any) {
    setSelected(dt);
    setDialog(false);
    setData([...data, dt]);
  }

  function handleDetails(dt: any) {
    history.push(`${localRoutes.groups}/${dt.id}`);
  }

  function handleFilter(value: any) {
    setFilter({ ...filter, ...value });
  }

  const starterData = selected
    ? {
        parent: {
          id: selected.id,
          name: selected.name,
        },
      }
    : undefined;

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.groups,
      filter,
      (data) => {
        setData(data);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }, [filter]);
  return (
    <Layout title="Groups">
      <Box>
        <Box mb={1}>
          <ListHeader
            title="Groups"
            onFilter={handleFilter}
            filter={filter}
            loading={loading}
            buttons={
              <>
                {hasAnyRole(user, [appPermissions.roleGroupEdit]) && (
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

        <TabbedView
          tabs={[
            {
              name: "List View",
              component: (
                <GroupsList
                  loading={loading}
                  data={data}
                  handleAddUnder={handleAddUnder}
                  handleDetails={handleDetails}
                  selected={selected}
                />
              ),
            },
            {
              name: "Map View",
              component: <Typography variant="h4">Coming soon</Typography>,
            },
          ]}
        />

        <EditDialog open={dialog} onClose={handleClose} title="Add new group">
          <GroupEditor
            data={starterData}
            isNew={true}
            onCreated={handleAdded}
            onCancel={handleClose}
          />
        </EditDialog>
      </Box>
    </Layout>
  );
};

export default GroupTabView;
