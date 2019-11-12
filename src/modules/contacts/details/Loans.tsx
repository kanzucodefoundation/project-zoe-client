import React, {useState} from "react";

import XTable from "../../../components/table/XTable";
import {XHeadCell} from "../../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import {fakeLoan, IConsumerLoan} from "../types";
import {printDecimal, printMoney} from "../../../utils/numberHelpers";
import {trimGuid} from "../../../utils/stringHelpers";

const headCells: XHeadCell[] = [
    {name: 'id', label: 'ID', render: (dt) => trimGuid(dt)},
    {name: 'lender', label: 'Lender',},
    {name: 'amount', label: 'Amount', numeric: true, render: (dt) => printMoney(dt)},
    {name: 'interestRate', label: 'Interest', numeric: true, render: (dt) => `${printDecimal(dt)}%`},
    {name: 'durationInMonths', label: 'Duration(Months)', numeric: true},
];

const fakeData: IConsumerLoan[] = [];
for (let i = 0; i < 65; i++) {
    fakeData.push(fakeLoan())
}
const Loans = () => {
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

export default Loans
