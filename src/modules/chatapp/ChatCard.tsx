import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Box } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ChatCard2 from "./ChatCard2";
import MessagesContainer from "./MessagesContainer";
// import Test from "./Test";



interface IProps {
  // title: string;
  messages:any;
  name:any;
  text: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      height:"50vh",
      backgroundColor: theme.palette.background.paper,
      overflowY:"scroll",
      // backgroundColor:"Red"
    },
    // fab: {
    //   position: "absolute",
    //   bottom: theme.spacing(2),
    //   right: theme.spacing(2),
    // },
  })
);

const ChatCard = (props: IProps) => {
const classes= useStyles()

  return (
    <Card elevation={0} className={classes.root} >
      <CardHeader
        // title={
        //   <Typography variant="body1">
        //     <b>{props.title}</b>
        //   </Typography>
        // }
      />
      {console.log(props.messages,'chatcard line 52')}
      {
        (props.messages)? 
        // Slot: Messages Container
        
          <MessagesContainer messages={props.messages}  name={props.name}  text={props.text}/> 
          // <Test messages={props.messages}  name={props.name}  text={props.text}/>          
           : <h1>No messages</h1>
      }
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

export default ChatCard;
