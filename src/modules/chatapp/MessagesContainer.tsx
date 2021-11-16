import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import { Box, Container, Paper, styled, Typography } from "@material-ui/core";
import ChatCard1 from "./ChatCard1";
import ChatCard2 from "./ChatCard2";

interface IProps {
  
  messages: any;
  name: any;
  text:any;
}


const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
const MessagesContainer = (props: IProps) => {
  console.log(props,'line21')
  const loggedinUserId = "1234" 
  // const name ="nick"
  // const [messages]= useState(props.messages)
  // {console.log(messages,'line 29')}
  
  return (
    <Box >
    <Grid >
    {console.log((props.text),'line 29')}
      {props.messages.map((message:any)=> {
        {console.log(message,'line 28')}
      //  return  (message.sender_id === loggedinUserId ) ?
       return  (message.name ===props.name ) ?
         <Grid container spacing={2}><Grid item sm={4}>
             <Item elevation={0}></Item>
           </Grid><Grid item sm={8}>
               <ChatCard1   text={props.text} name={props.name}  message={message}  key={message.id}/>
             </Grid></Grid>
         :
         <Grid container spacing={2}><Grid item sm={8}>
             <ChatCard2  message={message}  text={props.text} name={props.name}  key={message.id} />
           </Grid><Grid item sm={4}>
               <Item elevation={0}></Item>
             </Grid></Grid>     
      } )}


      </Grid>     
  </Box>
 );
};
export default MessagesContainer;
