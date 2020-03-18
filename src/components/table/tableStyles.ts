import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

export const useTableStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%'
        },
        paper: {
            width: '100%',
            borderRadius: 0
        },
        table: {
            minWidth: "100%",
        },
        tableWrapper: {
            overflowX: 'auto'
        },
        visuallyHidden: {
            border: 0,
            clip: 'rect(0 0 0 0)',
            height: 1,
            margin: -1,
            overflow: 'hidden',
            padding: 0,
            position: 'absolute',
            top: 20,
            width: 1,
        },
        tableHead: {
            backgroundColor: 'white'
        }
    }),
);





