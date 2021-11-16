import Grid from '@material-ui/core/Grid';
import { Form, Formik, FormikHelpers } from 'formik';
import React, { useEffect, useState } from 'react'
import XForm1 from '../../components/forms/XForm1';
import XTextInput from '../../components/inputs/XTextInput';
import io from 'socket.io-client';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import XList, { ListItemData } from '../../components/list/XList';
import BasicCard from './BasicCard';
import DataCard from '../../components/DataCard';
import ChatCard from './ChatCard';
import XTextAreaInput from '../../components/inputs/XTextAreaInput';
import Layout from '../../components/layout/Layout';
import { remoteRoutes, url } from '../../data/constants';
import uuid from 'uuid';
import { useSelector } from 'react-redux';
import { IState } from '../../data/types';
import ChatSidebar from './ChatSidebar';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { comboParser } from '../../components/inputs/inputHelpers';
import { get } from 'http';


// import ChatCard1 from './ChatCard1';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      // maxWidth: ,
      backgroundColor: theme.palette.background.paper,
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);
interface Message {
  id: string;
  // sender_id:string;
  name: string;
  text: string;
}

interface Payload {
  name: any;
  text: any;
}



const initialValues = {
  name: "",
  text:"",
}

const socket =io(url)



const Chatlib = () =>  {
  const user = useSelector((state: IState) => state.core.user); 
 
  const loggedIn = user.contactId  
  // user.cont
   const classes = useStyles();
  const [title] = useState('Chat Web');
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  const dummyMessages =[
    {
      "id":"5678",
      "sender_id":"5678",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"1234",
      "sender_id":"1234",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"5678",
      "sender_id":"5678",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"1234",
      "sender_id":"1234",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"5678",
      "sender_id":"5678",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"1234",
      "sender_id":"1234",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"5678",
      "sender_id":"5678",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"1234",
      "sender_id":"1234",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"5678",
      "sender_id":"5678",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
    {
      "id":"1234",
      "sender_id":"1234",
      "name":"Nick",
      "text":"Hello Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, Generate Lorem Ipsum placeholder text. Select the number of characters, words, sentences or paragraphs, and hit generate!words, sentences or paragraphs, and hit generate!, sentences or paragraphs, and hit generate!"
    },
  ]
  
  const [messages, setMessages] = useState<Message[]>([]);
  // const [message, setMessage] = useState<Message[]>([]);

  
 

  useEffect(() => {
    console.log("Hello")
    function receivedMessage(message: Payload) {
      const newMessage: Message = {
        id: uuid.v4(),
        name: message.name,
        text: message.text,
        // sender_id: ''
      };

      setMessages([...messages, newMessage]);
      console.log(messages)
      console.log(newMessage)
    }

    socket.on('msgToClient', (message: Payload) => {
      console.log(message,"useEffect")
      receivedMessage(message);
    });
  }, [messages, name, text]); 



  
  
  
  function validateInput(values:any) {
    return values.name.length > 0 && values.text.length > 0;
  }

  function sendMessage(values:any) {
    console.log(name,'line 159')
    console.log(text,'line 156')
    if (validateInput(values))
    {
      const message: Payload = {
       name: values.name,
        text: values.text,
      };

      socket.emit('msgToServer', message);
      console.log(message,'line 165')
      setText('');
    }
  
  }

    // validateInput()
    // .then(()=>{
    //   const message: Payload = {
    //     name,
    //     text,
    //   };

    //   socket.emit('msgToServer', message);
    //   console.log(message)    })


  function handleSubmit  (values:any , actions:FormikHelpers<any>) {
    console.log(values)
    console.log(values.name)
     setName(values.name)
     console.log(values.text)
     setText(values.text)
     sendMessage(values)


  }    
    
  
return(
  // <Layout>
    <XForm1 
  onSubmit={handleSubmit}
  initialValues={initialValues}
//   onCancel={done}   
   >
<Grid spacing={1} container>
        <Grid item xs={12}> 
        {/* {/* {console.log(peopleName,'line 235')} */}
        {/* <XRemoteSelect
                  name="name"
                  label="name"
                  remote={remoteRoutes.contactsPeopleCombo}
                  parser={comboParser}
                  variant="outlined"
                  multiple
                />  */}

           <XTextInput
            name="name"
            label="Name"
            type="text"
            variant="outlined"
             margin="none"
          />
     </Grid>  


<Grid container >
{/* <Grid item xs={4} lg={4} md={4} sm={12}  >
 <ChatSidebar/> 
</Grid> */}
{/* <Grid item xs={8} lg={8} md={8} sm={12} >
<ChatCard   title={'Angie Chat'}  messages={messages}   name={name}  text={text} />
</Grid> */}
  <ChatCard     messages={messages}   name={name}  text={text} />
{/* <Test/> */}
</Grid>

<Grid item xs={12}  >
{/* <ChatSidebar/> */}
</Grid>
     <Grid item xs={12}>

     <XTextInput
            name="text"
            label="Text"
            type="text"
            variant="outlined"
             margin="none"
             
       />
     </Grid>   
      </Grid>
</XForm1>
// {/* </Layout> */}

)


}

export default Chatlib;




// function user(arg0: string, user: any) {
//   throw new Error('Function not implemented.');
// }
//  <XTextAreaInput
      //  name={'Message'}
      //  variant="outlined"
      //  margin="none"