import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Alert from '@mui/material/Alert';
import { fetchQBConnection, getQBConnectUrl, disconnectQB } from './api';
import { apiBaseUrl } from '../../data/constants';

/**
 * The origin the OAuth callback page is served from — the API, not this app.
 * Only messages from that origin may end the connect flow.
 */
const OAUTH_CALLBACK_ORIGIN = new URL(apiBaseUrl, window.location.origin).origin;

const POPUP_W = 600;
const POPUP_H = 700;

export default function QuickBooksSettings() {
  const queryClient = useQueryClient();
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const closePopupAndRefresh = useCallback((message?: string, isError = false) => {
    stopPolling();
    popupRef.current?.close();
    popupRef.current = null;
    queryClient.invalidateQueries({ queryKey: ['qb-connection'] });
    if (message) {
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }
    }
  }, [queryClient, stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      // Stop if the user manually closed the popup
      if (popupRef.current?.closed) {
        stopPolling();
        // Still refetch in case the exchange completed just before they closed it
        queryClient.invalidateQueries({ queryKey: ['qb-connection'] });
        popupRef.current = null;
        return;
      }
      try {
        const status = await fetchQBConnection();
        if (status.connected) {
          closePopupAndRefresh('QuickBooks connected!');
        }
      } catch {
        // Transient polling errors are expected while the popup is open.
      }
    }, 2000);
  }, [stopPolling, closePopupAndRefresh, queryClient]);

  // Clean up the poll interval when the component unmounts
  useEffect(() => () => stopPolling(), [stopPolling]);

  const {
    data: connection,
    isLoading,
    isError: statusFailed,
    refetch,
  } = useQuery({
    queryKey: ['qb-connection'],
    queryFn: fetchQBConnection,
  });

  const { mutate: startConnect, isPending: isConnecting } = useMutation({
    mutationFn: getQBConnectUrl,
    onSuccess: ({ url }) => {
      const left = Math.round(window.screenX + (window.outerWidth - POPUP_W) / 2);
      const top = Math.round(window.screenY + (window.outerHeight - POPUP_H) / 2);
      popupRef.current = window.open(
        url,
        `quickbooks-connect-${Date.now()}`,
        `width=${POPUP_W},height=${POPUP_H},left=${left},top=${top},scrollbars=yes`,
      );
      if (!popupRef.current) {
        toast.error('Popup blocked — please allow popups for this site.');
        return;
      }
      startPolling();
    },
    onError: () => toast.error('Failed to start QuickBooks connection.'),
  });

  const { mutate: disconnect, isPending: isDisconnecting } = useMutation({
    mutationFn: disconnectQB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qb-connection'] });
      toast.success('QuickBooks disconnected.');
    },
    onError: () => toast.error('Failed to disconnect QuickBooks.'),
  });

  // postMessage from the popup is a fast-path — closes the popup immediately
  // without waiting for the next poll cycle.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Without these checks any page holding a handle on this window could
      // stop the polling and fake either outcome.
      if (event.origin !== OAUTH_CALLBACK_ORIGIN) return;
      if (!popupRef.current || event.source !== popupRef.current) return;

      if (event.data?.type === 'QB_CONNECT_SUCCESS') {
        closePopupAndRefresh('QuickBooks connected!');
      } else if (event.data?.type === 'QB_CONNECT_ERROR') {
        closePopupAndRefresh('QuickBooks connection failed. Please try again.', true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [closePopupAndRefresh]);

  const connected = connection?.connected === true;
  const conn = connected ? connection : null;

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Integrations
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Connect third-party services to sync data with your workspace.
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
            {/* QuickBooks wordmark */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: '#2CA01C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" fontWeight={800} sx={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>
                QB
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                QuickBooks Online
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sync accounting data and process payments via Intuit.
              </Typography>
            </Box>

            {isLoading ? (
              <Skeleton variant="rounded" width={90} height={24} />
            ) : connected ? (
              <Chip
                icon={<CheckCircleOutlineIcon fontSize="small" />}
                label="Connected"
                color="success"
                size="small"
                variant="outlined"
              />
            ) : statusFailed ? (
              <Chip
                icon={<ErrorOutlineIcon fontSize="small" />}
                label="Status unavailable"
                color="warning"
                size="small"
                variant="outlined"
              />
            ) : (
              <Chip
                icon={<ErrorOutlineIcon fontSize="small" />}
                label="Not connected"
                size="small"
                variant="outlined"
              />
            )}
          </Stack>

          {statusFailed && (

            <Alert

              severity="warning"

              sx={{ mt: 1.5 }}

              action={

                <Button color="inherit" size="small" onClick={() => refetch()}>

                  Retry

                </Button>

              }

            >

              Could not check the QuickBooks connection. This does not mean it is

              disconnected — the status request itself failed.

            </Alert>

          )}


          {connected && conn && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={0.75}>
                <Detail label="Company (Realm ID)" value={conn.realmId} />
                <Detail label="Environment" value={conn.environment} />
                <Detail
                  label="Access token expires"
                  value={new Date(conn.accessTokenExpiresAt).toLocaleString()}
                />
                <Detail
                  label="Refresh token expires"
                  value={new Date(conn.refreshTokenExpiresAt).toLocaleString()}
                />
              </Stack>
            </>
          )}
        </CardContent>

        <Divider />

        <CardActions sx={{ px: 2, py: 1.5, justifyContent: 'flex-end', gap: 1 }}>
          {isLoading ? (
            <Skeleton variant="rounded" width={120} height={36} />
          ) : connected ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LinkOffIcon />}
              onClick={() => disconnect()}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<LinkIcon />}
              onClick={() => startConnect()}
              disabled={isConnecting}
              sx={{ bgcolor: '#2CA01C', '&:hover': { bgcolor: '#238a16' } }}
            >
              {isConnecting ? 'Opening…' : 'Connect QuickBooks'}
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Stack>
  );
}
