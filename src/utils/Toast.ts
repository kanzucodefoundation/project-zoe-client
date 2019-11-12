import {toast} from 'react-toastify';

export const positions = {
    TOP_LEFT: toast.POSITION.TOP_LEFT,
    TOP_RIGHT: toast.POSITION.TOP_RIGHT,
    TOP_CENTER: toast.POSITION.TOP_CENTER,
    BOTTOM_LEFT: toast.POSITION.BOTTOM_LEFT,
    BOTTOM_RIGHT: toast.POSITION.BOTTOM_RIGHT,
    BOTTOM_CENTER: toast.POSITION.BOTTOM_CENTER
}

const defPosition = positions.TOP_CENTER

export default class Toast {
    public static success(message: string, position = defPosition) {
        toast.success(message, {
            position
        });
    }

    public static error(message: string, position = defPosition) {
        toast.error(message, {
            position
        });
    }

    public static warn(message: string, position = defPosition) {
        toast.warn(message, {
            position
        });
    }

    public static info(message: string, position = defPosition) {
        toast.info(message, {
            position
        });
    }
}
