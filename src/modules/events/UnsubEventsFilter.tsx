import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { remoteRoutes } from "../../data/constants";
import { PRemoteSelect } from "../../components/plain-inputs/PRemoteSelect";
import PDateInput from "../../components/plain-inputs/PDateInput";
import { useFilter } from "../../utils/fitlerUtilities";
import { format, lastDayOfWeek, startOfWeek } from "date-fns";

interface IProps {
  onFilter: (data: any) => any;
}

const today = new Date();
const startPeriod = startOfWeek(today);
const endPeriod = lastDayOfWeek(today);

const initialData: any = {
  query: "",
  reportFreqList: [],
  categoryIdList: [],
  from: `${format(new Date(startPeriod), "PP")}`,
  to: `${format(new Date(endPeriod), "PP")}`,
  limit: 200,
  skip: 0,
};
const UnsubEventsFilter = ({ onFilter }: IProps) => {
  const { data, handleComboChange, handleDateChange } = useFilter({
    initialData,
    onFilter,
    comboFields: ["categoryIdList", "reportFreqList"],
  });

  return (
    <form>
      <Grid spacing={2} container>
        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.groupCategoriesCombo}
            name="categoryIdList"
            label="Categories"
            variant="outlined"
            size="small"
            margin="none"
            multiple
            onChange={(value) => handleComboChange("categoryIdList", value)}
            value={data["categoryIdList"]}
            searchOnline
          />
        </Grid>

        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.groupReportFrequency}
            name="reportFreqList"
            label="Report Type"
            variant="outlined"
            size="small"
            margin="none"
            multiple={true}
            onChange={(value) => handleComboChange("reportFreqList", value)}
            value={data["reportFreqList"]}
            searchOnline
          />
        </Grid>

        <Grid item xs={12} md>
          <PDateInput
            name="from"
            value={data["from"]}
            onChange={(value) => handleDateChange("from", value)}
            label="From"
            inputVariant="outlined"
          />
        </Grid>

        <Grid item xs={12} md>
          <PDateInput
            name="to"
            value={data["to"]}
            label="To"
            inputVariant="outlined"
            onChange={(value) => handleDateChange("to", value)}
          />
        </Grid>
        <Grid></Grid>
      </Grid>
    </form>
  );
};

export default UnsubEventsFilter;
