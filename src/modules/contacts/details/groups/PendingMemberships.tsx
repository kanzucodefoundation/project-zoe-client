import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { remoteRoutes } from "../../../../data/constants";
import { get } from "../../../../utils/ajax";
import XList, { ListItemData } from "../../../../components/list/XList";
import { getInitials } from "../../../../utils/stringHelpers";
import { Alert } from "@material-ui/lab";

interface IRequest {
  id: number;
  groupName: string;
}

const PendingMemberships = (props: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.groupsRequest}/?contactId=${props.contactId}`,
      (data) => {
        let requests: IRequest[] = [];
        for (let i = 0; i < data.length; i++) {
          const single = {
            id: data[i].id,
            groupName: data[i].group.name,
          };

          requests.push(single);
        }
        setData(requests);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }, [props.contactId]);

  const dataParser = (dt: any): ListItemData => {
    return {
      primaryText: dt.groupName,
      secondaryText: "",
      avatar: getInitials(dt.name),
    };
  };

  // Implement this using a better approach
  // const onDelete = (id: string) => {
  //   del(`${remoteRoutes.groupsRequest}/${id}`, (resp) => {
  //     Toast.success("Request Successfully Deleted");
  //   });
  // };

  return (
    <Grid container>
      {data.length === 0 ? (
        <Alert severity="info">No pending requests!</Alert>
      ) : (
        <XList
          data={data}
          onSelect={(dt: any) => undefined}
          parser={dataParser}
        />
      )}
    </Grid>
  );
};

export default PendingMemberships;
