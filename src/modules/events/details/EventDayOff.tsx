import { Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { Button } from "@material-ui/core";
import { useSelector } from "react-redux";
import { IState } from "../../../data/types";
import { remoteRoutes } from "../../../data/constants";
import Toast from "../../../utils/Toast";
import { del, get, post, search } from "../../../utils/ajax";

interface IProps {
  data?: any;
}

const AvailabilityButtons = ({ data }: IProps) => {
  const user = useSelector((state: IState) => state.core.user);
  function handleSubmit() {
    const disable: any = {
      contactId: user.contactId,
      dayOff: data.start._date,
    };
    console.log(disable);

    // post(remoteRoutes.dayOff, disable, () => {
    //   Toast.info("Operation successful");
    //   window.location.reload();
    // });
  }

  return (
    <Box display="flex">
      <Typography> Will you be available? &nbsp;&nbsp; </Typography>
      <Box pr={1}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSubmit}
        >
          Yes &nbsp;&nbsp;
        </Button>
      </Box>
      <Box pr={1}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSubmit}
        >
          No &nbsp;&nbsp;
        </Button>
      </Box>
    </Box>
  );
};
export default AvailabilityButtons;


