import React, { useState } from "react";
import { XHeadCell } from "../../../../components/table/XTableHead";
import Grid from "@material-ui/core/Grid";
import { ITeamMember } from "../../types";
import XTable from "../../../../components/table/XTable";
import { get } from "../../../../utils/ajax";
import { localRoutes, remoteRoutes } from "../../../../data/constants";
import { useHistory } from "react-router";
import NewRequest from "./NewRequest";
import PendingMemberships from "./PendingMemberships";
import TabbedView from "../../../groups/TabbedView";
import { useSelector } from "react-redux";
import { IState } from "../../../../data/types";

const headCells: XHeadCell[] = [
  { name: "id", label: "ID" },
  { name: "name", label: "Name" },
  { name: "details", label: "Details" },
  { name: "role", label: "Role" }
];

const groupData = (data: any, i: number, groups: ITeamMember[]) => {
  get(remoteRoutes.groupsMembership + `/?contactId=` + data, resp => {
    if (i === resp.length) {
      return;
    }
    while (i < resp.length) {
      const single = {
        id: resp[i].group.id,
        name: resp[i].group.name,
        details: resp[i].group.groupDetails,
        role: resp[i].role
      };
      groups.push(single);
      i++;
    }
  });
  return groups;
};

const Groups = (props: any) => {
  let i = 0;
  const groups: ITeamMember[] = [];
  const history = useHistory();
  const [data, setData] = useState(groupData(props.contactId, i, groups));
  const loggedInUser = useSelector((state: IState) => state.core.user);

  const isMe = props.user.id === loggedInUser.id;

  const handleView = (dt: any) => {
    history.push(localRoutes.groups + "/" + dt);
  };

  const tabs = [
    {
      name: "Memberships",
      component: (
        <Grid item xs={12}>
          <XTable
            headCells={headCells}
            data={data}
            initialRowsPerPage={10}
            handleSelection={handleView}
          />
        </Grid>
      )
    }
  ];
  if (isMe) {
    tabs.push({
      name: "Pending Memberships",
      component: (
        <Grid item xs={12}>
          <PendingMemberships contactId={props.contactId} />
        </Grid>
      )
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {isMe ? (
          <NewRequest contactId={props.contactId} user={props.user} />
        ) : (
          undefined
        )}
      </Grid>
      <Grid item xs={12}>
        <TabbedView tabs={tabs} />
      </Grid>
    </Grid>
  );
};

export default Groups;
