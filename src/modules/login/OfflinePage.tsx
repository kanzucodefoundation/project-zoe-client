import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import { reloadPage } from '../../utils/browser';

interface OfflinePageProps {
    open: boolean;
}

const OfflinePage = ({ open }: OfflinePageProps) => {
    const handleRetry = () => {
        reloadPage();
    };

    return (
        <Dialog
            open={open}
            onClose={() => { }}
            aria-labelledby="offline-dialog-title"
            disableEscapeKeyDown
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(4px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    },
                },
            }}
            PaperProps={{
                sx: {
                    width: 'fit-content',
                    maxWidth: 420,
                    borderRadius: 3,
                    mx: 2,
                },
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '8px',
                }}
            >
                <WifiOffRoundedIcon
                    sx={{
                        fontSize: 42,
                        color: 'text.secondary',
                    }}
                />
            </div>

            <DialogTitle
                id="offline-dialog-title"
                sx={{
                    textAlign: 'center',
                    pb: 1,
                    fontWeight: 700,
                }}
            >
                No Internet Connection
            </DialogTitle>

            <DialogContent
                sx={{
                    textAlign: 'center',
                    px: { xs: 3, sm: 4 },
                    pb: 1,
                }}
            >
                <Typography color="text.secondary">
                    Please check your internet connection and try again.
                </Typography>
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: 'center',
                    px: 3,
                    pb: 3,
                    pt: 1,
                }}
            >
                <Button
                    variant="contained"
                    onClick={handleRetry}
                    sx={{
                        minWidth: 120,
                    }}
                >
                    Try Again
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OfflinePage;