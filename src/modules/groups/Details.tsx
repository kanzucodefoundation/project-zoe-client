import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import TextField from '@material-ui/core/TextField';
import {useTheme} from '@material-ui/core/styles';

interface IProps {
    open: boolean
    nodeData: any
    handleClose: () => any
    handleChange: (data: any) => any
}

export default function Details({nodeData, handleClose, open, handleChange}: IProps) {
    const {node, path} = nodeData
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [name, setTitle] = useState<string>(node.name)

    function onChange(e: any) {
        const title = e.target.value
        setTitle(title)
    }

    function onSubmit() {
        const nodeChanges = {name}
        handleChange({nodeChanges, node, path})
    }

    return (
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"

        >
            <DialogTitle id="responsive-dialog-title">{node.name}</DialogTitle>
            <DialogContent>
                <TextField
                    required
                    id="outlined-required"
                    label="Required"
                    value={name}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                    onChange={onChange}
                />
                <pre>
                        {JSON.stringify(node, null, 2)}
                </pre>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={onSubmit}>
                    Submit
                </Button>
                <Button onClick={handleClose} color="primary" autoFocus>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
