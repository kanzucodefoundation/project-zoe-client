import {
  Box,
  createStyles,
  Link,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import React from "react";
import XBreadCrumbs from "../../components/XBreadCrumbs";
import { localRoutes } from "../../data/constants";
import Layout from "./../../components/layout/Layout";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(1),
      },
    },
    links: {
        margin: theme.spacing(2)
    }
  })
);

const Help = () => {
    const classes = useStyles();
    const preventDefault = (event: React.SyntheticEvent) => event.preventDefault;

    return (
        <Layout>
            <Box className={classes.root}>
                <Box pb={2}>
                    <XBreadCrumbs
                        title="Help Center"
                        paths={[
                            {
                                path: localRoutes.home,
                                label: "Dashboard"
                            }
                        ]}
                    />
                </Box>
                <Typography variant='h4'>Tutorial Videos</Typography>
                <Box className={classes.links}>
                    <Link href="https://youtu.be/q0G3pAVD2Zg" onClick={preventDefault} variant="h6">
                        How to register as a visitor and approve members as an administrator.
                    </Link>
                    <br/>
                    <Link href="https://youtu.be/PtRNvkcFBP0" onClick={preventDefault} variant="h6">
                        How to manage your personal details
                    </Link>
                    <br/>
                    <Link href="https://youtu.be/gqKYO5XAb38" onClick={preventDefault} variant="h6">
                        How to manage group details and add, edit and remove members
                    </Link>
                    <br/>
                    <Link href="https://youtu.be/yvDth5gPrxk" onClick={preventDefault} variant="h6">
                        How to upload a list of members using a csv file 
                    </Link>
                    <br/>
                </Box>
            </Box> 
        </Layout>
    )
}

export default Help;
