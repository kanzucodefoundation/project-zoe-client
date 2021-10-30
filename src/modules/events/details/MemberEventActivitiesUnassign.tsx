import React, { useState } from "react";
import { appPermissions } from "../../../data/constants";
import {
  makeStyles,
  Theme,
  createStyles,
  IconButton,
  Box,
} from "@material-ui/core";
import EditDialog from "../../../components/EditDialog";
import EditIcon from "@material-ui/icons/Edit";
import MemberEventActivitiesUnAssignForm from "./MemberEventActivitiesUnAssignForm ";
import { useSelector } from "react-redux";
import { IState } from "../../../data/types";
import { hasAnyRole } from "../../../data/appRoles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

interface IProps {
  props: any;
}

const MemberEventActivitiesUnassign = (props: any) => {
  const [createDialog, setCreateDialog] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [data, setData] = useState<any[]>([]);
  const user = useSelector((state: IState) => state.core.user);

  const handleEdit = () => {
    // const { activityName,members} = dt;
    const members = props.members;
    //console.log(members, "###");
    // const toEdit = {

    //   activityName,
    //   members,
    // };
    setSelected(members);
    setCreateDialog(true);
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
    closeCreateDialog();
  };

  // function handleDelete() {
  //   del(`${remoteRoutes.memberEventActivities}`, (resp) => {
  //     console.log(resp);
  //   window.location.reload();
  //   Toast.success('Deleted successfully');
  //   });
  // }
  function closeCreateDialog() {
    setSelected(null);
    setCreateDialog(false);
  }
  const createTitle = "Unassign  Members ";
  const canEditUsers = hasAnyRole(user, [appPermissions.roleUserEdit]);

  return (
    <Box>
      <Box pr={2}>
        {canEditUsers && (
          <IconButton
            aria-label="Edit"
            color="primary"
            title="Unassign Members from activity"
            onClick={handleEdit}
          >
            <EditIcon />
          </IconButton>
        )}
        {/* <IconButton
          aria-label="Delete"
          color="primary"
          title="Delete activity and member"
          onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton> */}
      </Box>
      {canEditUsers && (
        <EditDialog
          // title={`Edit Activity ${selected?.members}`}
           title={createTitle}
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
        >
          <MemberEventActivitiesUnAssignForm
            //onUpdated={handleEdit}
            done={handleEdit}
            data={selected}
            isNew={!selected}
            onCancel={closeCreateDialog} />
        </EditDialog>
      )}
    </Box>
  );
};
export default MemberEventActivitiesUnassign;
