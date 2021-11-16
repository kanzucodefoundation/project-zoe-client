import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Box } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";


interface IProps {
  // useActionContent: boolean;
  // children: any;
  // title: string;
  // buttons: any;
  message:any;
  name:any;
  text: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "80%",
      height:"15vh",
      backgroundColor: "#F2F2F2",
      border:"1px solid grey",
      // padding:"15px",
      // overflowY:"scroll",
      // backgroundColor:"Red"
    },
    // fab: {
    //   position: "absolute",
    //   bottom: theme.spacing(2),
    //   right: theme.spacing(2),
    // },
  })
);
const ChatCard2 = (props: IProps) => {
  const classes= useStyles()
  // console.log(props.messages)
  return (
    <Card elevation={0}  className={classes.root}  >
      <CardHeader
        // title={
        //   <Typography variant="body1">
        //     <b>{props.title}</b>
        //   </Typography>
        // }
      />
            {(props.message) ?  (
          <CardContent style={{ paddingTop: 0, paddingBottom: 0 }}>
            {console.log((props.message.name),'line 51')}
       {/* <span>{props.messages[0].name}</span> */}
       <p>{props.message.name}</p> 
       <p>{props.message.text}</p> 
        {/* <p>{props.messages[0].text}</p>  */}
                 </CardContent>
      ) : <p>Hello</p> }

      {/* {props.useActionContent ? (
        <CardActionArea>
          <CardContent style={{ paddingTop: 0, paddingBottom: 0 }}>
            {props.children}
          </CardContent>
        </CardActionArea>
      ) : (
        <CardContent>{props.children}</CardContent>
      )} */}
      <CardActions>
        <Box display="flex" justifyContent="flex-end" width="100%">
          {/* {props.buttons} */}
        </Box>
      </CardActions>
    </Card>
  );
};

export default ChatCard2;
