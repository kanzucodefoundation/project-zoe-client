import * as React from "react";
import { useState } from "react";
import Grid from "@material-ui/core/Grid";
import { remoteRoutes } from "../../data/constants";
import { cleanComboValue } from "../../utils/dataHelpers";
import { PRemoteSelect } from "../../components/plain-inputs/PRemoteSelect";
import { ComboValue } from "../../components/plain-inputs/PComboInput";
import PDateInput from "../../components/plain-inputs/PDateInput";

interface IProps {
  onFilter: (data: any) => any;
}

const initialData: any = {
  query: "",
  groups: [],
  from: null,
  to: null,
  limit: 100,
  skip: 0
};
const EventsFilter = ({ onFilter }: IProps) => {
  const [data, setData] = useState(initialData);

  const handleComboChange = (name: string) => (value: ComboValue) => {
    const hasSingleElement = (v: any) => {
      return Array.isArray(value) && value.length === 1;
    };
    setData({ ...data, [name]: value });
    const filterName = hasSingleElement(value) ? `${name}[]` : name;
    onFilter({ ...data, [filterName]: cleanComboValue(value) });
  };

  const handleDateChange = (name: string) => (value: Date | null) => {
    setData({ ...data, [name]: value });
    onFilter({ ...data, [name]: value });
  };

  return (
    <form>
      <Grid spacing={2} container>
        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.groupsCombo}
            parser={({ name, id }: any) => ({ name: name, id: id })}
            name="groups"
            label="Group(s)"
            variant="outlined"
            size="small"
            margin="none"
            multiple
            onChange={handleComboChange("groups")}
            value={data["groups"]}
            searchOnline
          />
        </Grid>
        <Grid item xs={12} md>
          <PDateInput
            name="from"
            value={data["from"]}
            onChange={handleDateChange("from")}
            label="From"
            inputVariant="outlined"
          />
        </Grid>

        <Grid item xs={12} md>
          <PDateInput
            name="to"
            value={data["to"]}
            onChange={handleDateChange("from")}
            label="To"
            inputVariant="outlined"
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default EventsFilter;
