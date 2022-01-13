import { Box } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import React, { useState } from 'react';
import EditDialog from '../../../components/EditDialog';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';
import { del } from '../../../utils/ajax';
import AddHelpFileButton from './AddHelpFile';

const EditHelpFile = (data:any) => {
    const [createDialog, setCreateDialog] = useState(false);

    function handleEdit() {
        setCreateDialog(true);
    }

    function handleDelete() {
        del(`${remoteRoutes.help}/${data.value.id}`, (resp) => {
          console.log(resp);
        window.location.reload();
        Toast.success('Deleted successfully');
        });
    }
    function closeCreateDialog() {
        setCreateDialog(false);
    }

    const createTitle = 'Edit Help File';
     return (
        <Box>
        <Box pr={2}>
          <IconButton
            aria-label="Edit"
            color="primary"
            title="Edit Help File"
            onClick={handleEdit}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="Delete"
            color="primary"
            title="Delete Help File"
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
          <AddHelpFileButton
            data={data}
            isNew={false}
            onUpdated={handleEdit}
            done={closeCreateDialog}
          />
        </EditDialog>
      </Box>
     );
    };

export default EditHelpFile;