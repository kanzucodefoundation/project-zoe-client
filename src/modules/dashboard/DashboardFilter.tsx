import { Grid } from "@material-ui/core";
import { lastDayOfWeek, startOfWeek } from "date-fns/esm";
import React from "react";
import PDateInput from "../../components/plain-inputs/PDateInput";
import { PRemoteSelect } from "../../components/plain-inputs/PRemoteSelect";
import { remoteRoutes } from "../../data/constants";
import { useFilter } from "../../utils/fitlerUtilities";

interface IProps {
  onFilter: (data: any) => any;
}

const initialData: any = {
    groupIdList: [],
    from: startOfWeek(new Date()),
    to: lastDayOfWeek(new Date()),
    limit: 100,
    skip: 0,
}

const DashboardFilter = ({onFilter}: IProps) => {

    const { data, handleComboChange, handleDateChange } = useFilter({
        initialData,
        onFilter,
        comboFields: ["groupIdList"],
    });

    return (
        <form>
            
            <Grid spacing={2} container>
                <Grid item xs={6} md>
                  <PDateInput
                    name="startDate"
                    label="From"
                    inputVariant="outlined"
                    value={data['from']}
                    onChange={(value) => handleDateChange("from", value)}
                  />
                </Grid>
                <Grid item xs={6} md>
                  <PDateInput
                    name="to"
                    label="To"
                    inputVariant="outlined"
                    value={data['to']}
                    onChange={(value) => handleDateChange("to", value)}
                  />
                </Grid>
                <Grid item xs={12} md>
                  <PRemoteSelect
                    remote={remoteRoutes.groupsCombo}
                    name="groupIdList"
                    label="Groups"
                    variant="outlined"
                    size="small"
                    margin="none"
                    multiple
                    onChange={(value) => handleComboChange("groupIdList", value)}
                    value={data['groupIdList']}
                    searchOnline
                  />
                </Grid>
              </Grid>
            </form>
    )

}

export default DashboardFilter;
