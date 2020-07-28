import Toast from "./Toast";

export const sendEmail = (emailAddressOfReceiver: string, subjectLine: string, messageBody: string, successMessageInToast: string) => {
    // get a instance of sendgrid and set the API key
    const sendgrid = require('@sendgrid/mail');
    sendgrid.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);// construct an email
    const email = {
    to: emailAddressOfReceiver,
    from: process.env.REACT_APP_FROM, // must include email address of the sender
    subject: subjectLine,
    html: messageBody,
    };// send the email via sendgrid
    sendgrid.send(email)
    .then(() => { Toast.info(successMessageInToast) }, (error: { response: { body: any; }; }) => {
        console.error(error);
     
        if (error.response) {
          console.error(error.response.body)
        }
    });
}