import { Box } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import React, { useState } from 'react';
import EditDialog from '../../../components/EditDialog';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';
import { del } from '../../../utils/ajax';
import NewReportCategories from './NewReportCategories';

const EditReportCategories = (data: any) => {
  const [createDialog, setCreateDialog] = useState(false);

  function handleEdit() {
    setCreateDialog(true);
  }

  function handleDelete() {
    del(`${remoteRoutes.eventsField}/${data.value.id}`, (resp) => {
      Toast.success('Field Deleted successfully');
      window.location.reload();
    });
  }
  function closeCreateDialog() {
    setCreateDialog(false);
  }
  const createTitle = 'Edit ReportCategories';
  return (
    <Box>
      <Box pr={2}>
        <IconButton
          aria-label="Edit"
          color="primary"
          title="Edit Report category"
          onClick={handleEdit}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label="Delete"
          color="primary"
          title="Delete Report category"
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
        <NewReportCategories
          data={data}
          isNew={false}
          onUpdated={handleEdit}
          done={closeCreateDialog}
        />
      </EditDialog>
    </Box>
  );
};
export default EditReportCategories;
