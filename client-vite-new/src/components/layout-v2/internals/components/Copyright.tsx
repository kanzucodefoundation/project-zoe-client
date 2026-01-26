import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type {$TsFixMe} from "../../../../utils/types.ts";

export default function Copyright(props: $TsFixMe) {
  return (
    <Typography
      variant="body2"
      align="center"
      {...props}
      sx={[
        {
          color: 'text.secondary',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      {'Copyright © '}
      <Link color="inherit" href="https://projectzoe.kanzucodefoundation.org/">
        Project Zoe
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
