import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import Navigation from "../../../components/layout/Layout";
import { getRouteParam } from "../../../utils/routHelpers";
import { IContact } from "../types";
import Loading from "../../../components/Loading";
import Error from "../../../components/Error";
import { createStyles, Grid, makeStyles, Theme } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Profile from "./info/Profile";
import ContactGroups from "./groups/ContactGroups";
import Info from "./info/Info";
import { get } from "../../../utils/ajax";
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from "../../../data/constants";
import { useDispatch, useSelector } from "react-redux";
import { crmConstants } from "../../../data/contacts/reducer";
import { IState } from "../../../data/types";
import XBreadCrumbs from "../../../components/XBreadCrumbs";
import PendingMemberships from "./groups/PendingMemberships";
import { hasAnyRole } from "../../../data/appRoles";

interface IProps extends RouteComponentProps {}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1),
      borderRadius: 0,
      minHeight: "100%",
      overflow: "show",
    },
    divider: {
      marginTop: theme.spacing(2),
    },
    noPadding: {
      padding: 0,
    },
  })
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      <Box paddingTop={2}>{children}</Box>
    </Typography>
  );
}

function a11yProps(index: any) {
  return {
    id: `wrapped-tab-${index}`,
    "aria-controls": `wrapped-tabpanel-${index}`,
  };
}

const ContactDetails = (props: IProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const data: IContact | undefined = useSelector(
    (state: any) => state.crm.selected
  );
  const profile = useSelector((state: IState) => state.core.user);
  const contactId =
    getRouteParam(props, "contactId") === "me"
      ? profile.contactId
      : getRouteParam(props, "contactId");
  const isOwnProfile = contactId === profile.contactId;
  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = React.useState("summary");

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.contacts}/${contactId}`,
      (resp) =>
        dispatch({
          type: crmConstants.crmFetchOne,
          payload: resp,
        }),
      undefined,
      () => setLoading(false)
    );
  }, [dispatch, contactId]);
  const hasError = !loading && !data;
  return (
    <Navigation>
      <Box pb={1}>
        <XBreadCrumbs
          title="Person details"
          paths={[
            {
              path: localRoutes.home,
              label: "Dashboard",
              auth: hasAnyRole(profile, [appPermissions.roleDashboard]),
            },
            {
              path: localRoutes.contacts,
              label: "People",
              auth: hasAnyRole(profile, [
                appPermissions.roleCrmView,
                appPermissions.roleCrmEdit,
              ]),
            },
          ]}
        />
      </Box>
      {loading && <Loading />}
      {hasError && <Error text="Failed load contact" />}
      {data && (
        <div className={classes.root}>
          <Grid container spacing={2}>
            <Grid item xs={12} style={{ paddingBottom: 0 }}>
              <Profile data={data} />
              <Divider className={classes.divider} />
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <AppBar position="static" color="inherit" elevation={0}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="wrapped label tabs example"
                >
                  <Tab
                    key="summary"
                    value="summary"
                    label="Summary"
                    {...a11yProps("summary")}
                  />
                  <Tab
                    key="groups"
                    value="groups"
                    label="Groups"
                    {...a11yProps("groups")}
                  />
                  {isOwnProfile && (
                    <Tab
                      key="requests"
                      value="requests"
                      label="Pending requests"
                      {...a11yProps("requests")}
                    />
                  )}
                </Tabs>
              </AppBar>
              <Divider />
              <TabPanel value={value} index="summary">
                <Info data={data} />
              </TabPanel>
              <TabPanel value={value} index="groups">
                <ContactGroups
                  contactId={contactId}
                  contact={data}
                  isOwnProfile={isOwnProfile}
                  profile={profile}
                />
              </TabPanel>
              {isOwnProfile && (
                <TabPanel value={value} index="requests">
                  <PendingMemberships contactId={contactId} />
                </TabPanel>
              )}
            </Grid>
          </Grid>
        </div>
      )}
    </Navigation>
  );
};

export default withRouter(ContactDetails);
