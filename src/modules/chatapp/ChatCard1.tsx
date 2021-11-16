import React, { useState } from "react";
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
  text:any;
  name:any;
  message:any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width:"80%",
      height:"15vh",
      color:"white",
      // padding:"15px",
      // maxWidth: ,
      // backgroundColor: theme.palette.background.paper,
      backgroundColor:"#009688",
      // background-color: #0097a7   
     },
    // fab: {
    //   position: "absolute",
    //   bottom: theme.spacing(2),
    //   right: theme.spacing(2),
    // },
  })
);

const ChatCard1 = (props: IProps) => {
  const classes=useStyles()
  return (
    <Card elevation={0}   className={classes.root}>

      
      <CardHeader
        // title={
        //   <Typography variant="body1"   >
        //     <b>{props.title}</b>
        //   </Typography>
        // }
      />
{console.log(props.message,'line 51')}
{console.log(props.text,'line 54')}

            {/* <p>Hello there</p> */}
            {(props.message) ?  (
          <CardContent style={{ paddingTop: 0, paddingBottom: 0 }}>
            {console.log(props.message,'line 59')}
            <p>{props.message.name}</p> 
            {/* <p>{props.message[0].name}</p>  */}
       {/* <span>{props.name}</span>
       <p>{props.text}</p>
              <p>{props.text}</p>  */}
        {/* <p>{props.message[0].text}</p>  */}
        <p>{props.message.text}</p> 

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

export default ChatCard1

