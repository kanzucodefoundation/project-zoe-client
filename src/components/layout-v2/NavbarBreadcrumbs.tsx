import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { localRoutes } from '../../data/constants';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

// Turn a path like '/admin/financial-management/category-rules' into a regex,
// treating ':param' segments as wildcards.
function pathToRegex(path: string): RegExp {
  const pattern = path
    .split('/')
    .map((segment) =>
      segment.startsWith(':')
        ? '[^/]+'
        : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/');
  return new RegExp(`^${pattern}$`);
}

// Turn a constants key like 'financialCategoryRules' into 'Financial Category Rules'
function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

// Built once from localRoutes — most specific (most segments) first, so e.g.
// '/tasks/mine' is checked before the more generic '/tasks'.
const routeEntries = Object.entries(localRoutes)
  .map(([key, path]) => ({ key, path, regex: pathToRegex(path) }))
  .sort((a, b) => b.path.split('/').length - a.path.split('/').length);

function getPageLabel(pathname: string): string {
  if (pathname === '/' || pathname === localRoutes.dashboard) return 'Home';
  const match = routeEntries.find(({ regex }) => regex.test(pathname));
  return match ? humanizeKey(match.key) : 'Home';
}

export default function NavbarBreadcrumbs() {
  const { pathname } = useLocation();
  const currentPage = useMemo(() => getPageLabel(pathname), [pathname]);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Dashboard</Typography>
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
        {currentPage}
      </Typography>
    </StyledBreadcrumbs>
  );
}
