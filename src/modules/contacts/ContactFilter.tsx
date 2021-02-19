import * as React from "react";
import { useState } from "react";
import Grid from "@material-ui/core/Grid";
import { remoteRoutes } from "../../data/constants";
import { cleanComboValue } from "../../utils/dataHelpers";
import { TextField } from "@material-ui/core";
import { PRemoteSelect } from "../../components/plain-inputs/PRemoteSelect";
import { ComboValue } from "../../components/plain-inputs/PComboInput";

interface IProps {
  onFilter: (data: any) => any;
}

const initialData: any = {
  query: "",
  churchLocations: [],
  cellGroups: [],

  email: "",
  phone: "",
  limit: 100,
  skip: 0
};
const ContactFilter = ({ onFilter }: IProps) => {
  const [data, setData] = useState(initialData);

  function handleChange(event: React.ChangeEvent<any>) {
    const name = event.target.name;
    const value = event.target.value;
    const newData = { ...data, [name]: value };
    setData({ ...newData });
    onFilter(newData);
  }

  const handleComboChange = (name: string) => (value: ComboValue) => {
    const hasSingleElement = (v: any) => {
      return Array.isArray(value) && value.length === 1;
    };
    setData({ ...data, [name]: value });
    const filterName = hasSingleElement(value) ? `${name}[]` : name;
    onFilter({ ...data, [filterName]: cleanComboValue(value) });
  };

  function handleClear() {
    setData(initialData);
    onFilter(initialData);
  }

  return (
    <form>
      <Grid spacing={2} container>
        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.groupsCombo}
            filter={{ "categories[]": "Location" }}
            parser={({ name, id }: any) => ({ name: name, id: id })}
            name="churchLocations"
            label="Location"
            variant="outlined"
            size="small"
            margin="none"
            multiple
            onChange={handleComboChange("churchLocations")}
            value={data["churchLocations"]}
            searchOnline
          />
        </Grid>
        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.groupsCombo}
            filter={{ "categories[]": "MC" }}
            parser={({ name, id }: any) => ({ name: name, id: id })}
            name="cellGroups"
            label="MC"
            variant="outlined"
            size="small"
            margin="none"
            multiple
            onChange={handleComboChange("cellGroups")}
            value={data["cellGroups"]}
            searchOnline
          />
        </Grid>

        <Grid item xs={12} md>
          <TextField
            name="email"
            value={data["email"]}
            onChange={handleChange}
            label="Email"
            type="email"
            variant="outlined"
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md>
          <TextField
            name="phone"
            value={data["phone"]}
            onChange={handleChange}
            label="Phone"
            type="text"
            variant="outlined"
            size="small"
            fullWidth
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ContactFilter;
