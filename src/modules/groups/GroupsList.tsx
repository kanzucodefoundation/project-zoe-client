import React from "react";
import XTreeData from "../../components/tree/XTreeData";
import arrayToTree from "array-to-tree";
import { IGroup } from "./types";
import InfoMessage from "../../components/messages/InfoMessage";
import Box from "@material-ui/core/Box";
import Loading from "../../components/Loading";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";

interface IProps {
  data: IGroup[];
  selected: IGroup | null;
  loading: boolean;
  handleAddUnder: any;
  handleDetails: any;
}

const GroupsList = ({
  data,
  loading,
  handleAddUnder,
  handleDetails
}: IProps) => {
  const openRecords = data.map(it => it.id);
  const treeData: any = arrayToTree(data, {
    parentProperty: "parentId",
    customID: "id"
  });

  return (
    <Box p={1}>
      <Box display="flex" justifyContent="center">
        {loading ? (
          <Loading />
        ) : data.length > 0 ? (
          <Grid container>
            <Hidden smDown>
              <Grid item md={3}>
                &nbsp;
              </Grid>
            </Hidden>
            <Grid item md={6}>
              <XTreeData
                data={treeData}
                open={openRecords}
                onAddUnder={handleAddUnder}
                onDetails={handleDetails}
              />
            </Grid>
            <Hidden smDown>
              <Grid item md={3}>
                &nbsp;
              </Grid>
            </Hidden>
          </Grid>
        ) : (
          <InfoMessage text="No records found" />
        )}
      </Box>
    </Box>
  );
};

export default GroupsList;
