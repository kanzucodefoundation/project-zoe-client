import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { remoteRoutes } from "../../data/constants";
import { TextField } from "@material-ui/core";
import { PRemoteSelect } from "../../components/plain-inputs/PRemoteSelect";
import { useFilter } from "../../utils/fitlerUtilities";

interface IProps {
  onFilter: (data: any) => any;
}

const initialData: any = {
  query: "",
  "churchLocations[]": [],
  "cellGroups[]": [],

  email: "",
  phone: "",
  limit: 100,
  skip: 0,
};
const ContactFilter = ({ onFilter }: IProps) => {
  const { data, handleTextChange, handleComboChange } = useFilter({
    initialData,
    onFilter,
    comboFields: ["churchLocations[]", "cellGroups[]"],
  });

  return (
    <form>
      <Grid spacing={2} container>
        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.groupsCombo}
            filter={{ "categories[]": "Location" }}
            parser={({ name, id }: any) => ({ name: name, id: id })}
            name="churchLocations[]"
            label="Location"
            variant="outlined"
            size="small"
            margin="none"
            multiple
            onChange={(value) => handleComboChange("churchLocations[]", value)}
            value={data["churchLocations[]"]}
            searchOnline
          />
        </Grid>
        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.groupsCombo}
            filter={{ "categories[]": "MC" }}
            parser={({ name, id }: any) => ({ name: name, id: id })}
            name="cellGroups[]"
            label="MC"
            variant="outlined"
            size="small"
            margin="none"
            multiple
            onChange={(value) => handleComboChange("cellGroups[]", value)}
            value={data["cellGroups[]"]}
            searchOnline
          />
        </Grid>

        <Grid item xs={12} md>
          <TextField
            name="email"
            value={data["email"]}
            onChange={(value) => handleTextChange("email", value)}
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
            onChange={(value) => handleTextChange("phone", value)}
            label="Phone"
            type="number"
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
