import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { getQueue } from './offlineQueue';

interface Props {
  onSync?: () => void;
}

export default function OfflineBanner({ onSync }: Props) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(getQueue().length);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const pending = getQueue();
      if (pending.length > 0 && onSync) {
        setSyncing(true);
        onSync();
        // Give it a moment, then refresh queue count
        setTimeout(() => {
          setQueueCount(getQueue().length);
          setSyncing(false);
        }, 3000);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onSync]);

  // Keep queue count fresh
  useEffect(() => {
    const interval = setInterval(() => setQueueCount(getQueue().length), 5000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && queueCount === 0) return null;

  return (
    <Box sx={{ mb: 1 }}>
      {!isOnline && (
        <Alert severity="warning" sx={{ borderRadius: 1 }}>
          Offline — check-ins are queued and will sync when connection returns.
          {queueCount > 0 && ` (${queueCount} pending)`}
        </Alert>
      )}
      {isOnline && queueCount > 0 && (
        <Alert
          severity="info"
          icon={syncing ? <CircularProgress size={16} /> : undefined}
          sx={{ borderRadius: 1 }}
        >
          {syncing
            ? `Syncing ${queueCount} offline check-in${queueCount > 1 ? 's' : ''}…`
            : `${queueCount} check-in${queueCount > 1 ? 's' : ''} pending sync.`}
        </Alert>
      )}
    </Box>
  );
}
