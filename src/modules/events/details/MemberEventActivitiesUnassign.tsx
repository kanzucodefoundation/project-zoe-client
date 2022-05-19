import React, { useState } from 'react';
import {
  makeStyles,
  Theme,
  createStyles,
  IconButton,
  Box,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { useSelector } from 'react-redux';
import { appPermissions } from '../../../data/constants';
import EditDialog from '../../../components/EditDialog';
import MemberEventActivitiesUnAssignForm from './MemberEventActivitiesUnAssignForm ';
import { IState } from '../../../data/types';
import { hasAnyRole } from '../../../data/appRoles';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

interface IProps {
  props: any;
}

const MemberEventActivitiesUnassign = (props: any) => {
  const [createDialog, setCreateDialog] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [data, setData] = useState<any[]>([]);
  const user = useSelector((state: IState) => state.core.user);

  const handleEdit = () => {
    const { members } = props;

    setSelected(members);
    setCreateDialog(true);
  };

  function closeCreateDialog() {
    setCreateDialog(false);
  }
  const createTitle = 'Unassign  Members ';
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
      </Box>
      {canEditUsers && (
        <EditDialog
          open={createDialog}
          onClose={closeCreateDialog}
          title={createTitle}
        >
          <MemberEventActivitiesUnAssignForm
            onUpdated={handleEdit}
            data={selected}
            onCancel={closeCreateDialog}
            isNew={true}
            done={closeCreateDialog}
          />
        </EditDialog>
      )}
    </Box>
  );
};
export default MemberEventActivitiesUnassign;
