import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { remoteRoutes } from "../../data/constants";
import { PRemoteSelect } from "../../components/plain-inputs/PRemoteSelect";
import PDateInput from "../../components/plain-inputs/PDateInput";
import { useFilter } from "../../utils/fitlerUtilities";

interface IProps {
  onFilter: (data: any) => any;
}

const initialData: any = {
  query: "",
  groupIdList: [],
  categoryIdList: [],
  from: null,
  to: null,
  limit: 100,
  skip: 0,
};
const EventsFilter = ({ onFilter }: IProps) => {
  const { data, handleComboChange, handleDateChange } = useFilter({
    initialData,
    onFilter,
    comboFields: ["categoryIdList", "groupIdList"],
  });
  return (
    <form>
      <Grid spacing={2} container>
        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.eventsCategories}
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
            remote={remoteRoutes.groupsCombo}
            name="groupIdList"
            label="Groups"
            variant="outlined"
            size="small"
            margin="none"
            multiple
            onChange={(value) => handleComboChange("groupIdList", value)}
            value={data["groupIdList"]}
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
      </Grid>
    </form>
  );
};

export default EventsFilter;
