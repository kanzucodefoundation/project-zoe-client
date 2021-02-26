import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box p={2}>{children}</Box>}
    </div>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    maxWidth: "100%",
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  }
}));

interface TabItem {
  name: string;
  component: any;
}

interface IProps {
  tabs: TabItem[];
}

const TabbedView = ({ tabs }: IProps) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Tabs value={value} onChange={handleChange} aria-label="group tabs">
          {tabs.map(it => (
            <Tab label={it.name} key={it.name} />
          ))}
        </Tabs>
      </AppBar>
      <Box width="100%">
        {tabs.map((it, index) => (
          <TabPanel value={value} index={index} key={it.name}>
            {it.component}
          </TabPanel>
        ))}
      </Box>
    </div>
  );
};

export default TabbedView;
