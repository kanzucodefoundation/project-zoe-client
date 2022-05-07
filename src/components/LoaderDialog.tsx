import React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import Loading from './Loading';

interface IProps {
  open: boolean;
  onClose?: () => any;
}

const LoaderDialog = ({ open, onClose = () => undefined }: IProps) => (
        <Dialog open={open} onClose={onClose} disableBackdropClick disableEscapeKeyDown>
            <DialogContent>
                <Loading/>
            </DialogContent>
        </Dialog>
);

export default LoaderDialog;
