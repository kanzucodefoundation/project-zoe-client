import React, {useState} from "react";

import XTable from "../../../components/table/XTable";
import {XHeadCell} from "../../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import {fakeTeam, ITeamMember} from "../types";
import {trimGuid} from "../../../utils/stringHelpers";

const headCells: XHeadCell[] = [
    {name: 'id', label: 'ID', render: (dt) => trimGuid(dt)},
    {name: 'name', label: 'Name'},
    {name: 'details', label: 'Details'},
    {name: 'role', label: 'Role'},

];

const fakeData: ITeamMember[] = [];
for (let i = 0; i < 12; i++) {
    fakeData.push(fakeTeam())
}
const Teams = () => {
    const [data, setData] = useState(fakeData);
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <XTable
                    headCells={headCells}
                    data={data}
                    initialRowsPerPage={10}
                />
            </Grid>
        </Grid>
    );
}

export default Teams
