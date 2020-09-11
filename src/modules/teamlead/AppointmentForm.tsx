import * as React from 'react';
import Paper from '@material-ui/core/Paper';

import {
    Appointments,
    AppointmentTooltip,
    AppointmentForm,

} from '@devexpress/dx-react-scheduler-material-ui';



export default class Calendar extends React.PureComponent<{}, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            data: [],
            defaultCurrentDate: new Date(),
        };



    }


    render() {



        return (


            <Paper>


                <Appointments
                />


                <AppointmentTooltip
                    showCloseButton
                    showDeleteButton
                    showOpenButton
                />
                <AppointmentForm />

            </Paper>

        );
    }
}
