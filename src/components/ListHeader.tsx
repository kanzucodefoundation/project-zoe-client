import React, { useState } from "react";
import { Breadcrumbs, Link } from "@material-ui/core";

import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import FilterListIcon from "@material-ui/icons/FilterList";
import Grid from "@material-ui/core/Grid";
import { localRoutes } from "../data/constants";

interface IProps {
  onFilter: (data: any) => void;
  filter: any;
  buttons?: any;
  loading: boolean;
  filterComponent?: any;
  title: string;
  showBreadCrumbs?: boolean;
}

const ListHeader = (props: IProps) => {
  const [showFilter, setShowFilter] = useState(false);
  const { showBreadCrumbs = true } = props;

  function handleFilterToggle() {
    setShowFilter(!showFilter);
  }

  function handleNameSearch(query: string) {
    props.onFilter({ ...props.filter, query });
  }

  return (
    <div>
      {showBreadCrumbs && (
        <Box pb={1}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link
              variant="body1"
              color="inherit"
              to={localRoutes.home}
              component={RouterLink}
            >
              Dashboard
            </Link>
            <Typography variant="body1" color="textPrimary">
              {props.title}
            </Typography>
          </Breadcrumbs>
        </Box>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            autoComplete="off"
            hiddenLabel
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="inherit" />
                </InputAdornment>
              )
            }}
            onChange={e => handleNameSearch(e.target.value)}
            variant="outlined"
            size="small"
            name="query"
            placeholder="Search here ..."
            fullWidth
          />
        </Grid>
        <Hidden smDown>
          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="flex-end"
              width="100%"
            >
              {props.filterComponent && (
                <Button
                  variant="text"
                  color="primary"
                  startIcon={<FilterListIcon />}
                  onClick={handleFilterToggle}
                  style={{ marginLeft: 8 }}
                >
                  More Filters&nbsp;&nbsp;
                </Button>
              )}
              {props.buttons}
            </Box>
          </Grid>
        </Hidden>
        {props.filterComponent && (
          <Grid item xs={12}>
            <Collapse in={showFilter} timeout="auto" unmountOnExit>
              <Box pb={1}>{props.filterComponent}</Box>
            </Collapse>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
export default ListHeader;
