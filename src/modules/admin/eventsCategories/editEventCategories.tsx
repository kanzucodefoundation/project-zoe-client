import { Box } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import React, { useState } from 'react';
import EditDialog from '../../../components/EditDialog';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';
import { del } from '../../../utils/ajax';
import NewEventCategories from './NewEventCategories';

const EditEventCategories = (data: any) => {
  const [createDialog, setCreateDialog] = useState(false);

  function handleEdit() {
    setCreateDialog(true);
  }

  function handleDelete() {
    del(`${remoteRoutes.eventsCategories}/${data.value.id}`, (resp) => {
      window.location.reload();
      Toast.success('Deleted successfully');
    });
  }
  function closeCreateDialog() {
    setCreateDialog(false);
  }
  const createTitle = 'Edit Event Categories';
  return (
    <Box>
      <Box pr={2}>
        <IconButton
          aria-label="Edit"
          color="primary"
          title="Edit Event category"
          onClick={handleEdit}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label="Delete"
          color="primary"
          title="Category deleted"
          onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <EditDialog
        title={createTitle}
        open={createDialog}
        onClose={closeCreateDialog}
      >
        <NewEventCategories
          data={data}
          isNew={false}
          onUpdated={handleEdit}
          done={closeCreateDialog}
        />
      </EditDialog>
    </Box>
  );
};
export default EditEventCategories;
