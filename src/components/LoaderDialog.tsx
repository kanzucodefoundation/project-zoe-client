import React from 'react';
import DialogContent from "@material-ui/core/DialogContent";
import Loading from "./Loading";
import Dialog from "@material-ui/core/Dialog";

interface IProps {
    open: boolean
    onClose?: () => any
}

const LoaderDialog = ({open, onClose = () => undefined}: IProps) => {
    return (
        <Dialog open={open} onClose={onClose} disableBackdropClick disableEscapeKeyDown>
            <DialogContent>
                <Loading/>
            </DialogContent>
        </Dialog>
    );
}

export default LoaderDialog;
