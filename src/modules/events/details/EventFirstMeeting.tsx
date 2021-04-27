import React from "react";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import XAvatar from "../../../components/XAvatar";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { useState, useEffect } from "react";
import { IProps, IAttendance, processData } from "./EventAttendance";
import { search } from "../../../utils/ajax";
import { remoteRoutes } from "../../../data/constants";
import Loading from "../../../components/Loading";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

export default function EventFirstMeeting({ groupId, eventId }: IProps) {
  const classes = useStyles();
  const [data, setData] = useState<IAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.eventsAttendance,
      { eventId, groupId },
      (resp) => {
        const { attendance, memberships } = resp;
        setData(processData(attendance, memberships, eventId));
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }, [groupId, eventId]);

  return (
    <Box>
      <List dense className={classes.root}>
        {loading ? (
          <Loading />
        ) : (
          data.map(
            (it) =>
              it.isVisitor && (
                <ListItem key={it.contactId} button>
                  <ListItemAvatar>
                    <XAvatar value={it.contact.name} />
                  </ListItemAvatar>
                  <ListItemText id={it.id} primary={it.contact.name} />
                </ListItem>
              )
          )
        )}
      </List>
    </Box>
  );
}
