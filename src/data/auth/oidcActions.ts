export const LOAD_SUBSCRIPTIONS_START =
    "dfcu_backoffice/LOAD_SUBSCRIPTIONS_START";
export const LOAD_SUBSCRIPTIONS_SUCCESS =
    "dfcu_backoffice/LOAD_SUBSCRIPTIONS_SUCCESS";

export function loadSubscriptionsStart() {
    return {
        type: LOAD_SUBSCRIPTIONS_START
    };
}

export function loadSubscriptionsSuccess(channels:any) {
    return {
        type: LOAD_SUBSCRIPTIONS_SUCCESS,
        payload: channels
    };
}
