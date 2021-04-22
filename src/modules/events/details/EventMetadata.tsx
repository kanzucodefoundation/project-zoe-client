import React from "react";
import { Grid, GridSpacing } from "@material-ui/core";
import { sortBy } from "lodash";

import { IEvent } from "../types";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { parseXpath } from "../../../utils/jsonHelpers";
import { printNumber } from "../../../utils/numberHelpers";
import { printDate, printDateTime } from "../../../utils/dateHelpers";

interface IProps {
  event: IEvent;
  sizes?: {
    [name: string]: number;
  };
  spacing?: GridSpacing;
}

const Label = (props: { label: string; value: any }) => (
  <Box width="100%" pb={1}>
    <Box width="100%">
      <Typography variant="caption">
        <b>{props.label}:</b>
      </Typography>
    </Box>
    <Box width="100%">
      <Typography variant="body2">{props.value || ""}</Typography>
    </Box>
  </Box>
);

const EventMetadata = ({
  event,
  sizes = { xs: 12, md: 6 },
  spacing = 2,
}: IProps) => {
  const createField = (it: any) => {
    const value = parseXpath(event.metaData || {}, it.name);
    if (it.type === "number") {
      return (
        <Grid key={it.name} item {...sizes}>
          <Label label={it.label} value={printNumber(value)} />
        </Grid>
      );
    }
    if (it.type === "date") {
      return (
        <Grid key={it.name} item {...sizes}>
          <Label label={it.label} value={printDate(value)} />
        </Grid>
      );
    }
    if (it.type === "datetime") {
      return (
        <Grid key={it.name} item {...sizes}>
          <Label label={it.label} value={printDateTime(value)} />
        </Grid>
      );
    }
    if (it.type === "textarea") {
      return (
        <Grid key={it.name} item {...sizes}>
          <Label label={it.label} value={value} />
        </Grid>
      );
    }
    return (
      <Grid key={it.name} item {...sizes}>
        <Label label={it.label} value={value} />
      </Grid>
    );
  };

  return (
    <div>
      <Grid spacing={spacing} container>
        {sortBy(event.categoryFields, "order").map(createField)}
      </Grid>
    </div>
  );
};

export default EventMetadata;
