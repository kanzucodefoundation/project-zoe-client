import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { del } from '../../utils/ajax';
import Toast from '../../utils/Toast';

export interface Props {
  url: string;
  id: any;
  action: string;
  onDone?: () => any;
}

export function useDelete<T extends { id: any }>(props: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  function handleDelete() {
    setLoading(true);
    del(
      props.url,
      () => {
        Toast.success('Operation succeeded');
        dispatch({
          type: props.action,
          payload: props.id,
        });
        props.onDone && props.onDone();
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  }

  return {
    loading,
    handleDelete,
  };
}
