
let gapi = window.gapi
const CALENDAR_API_KEY = process.env.REACT_APP_CALENDAR_API_KEY;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const DISCOVERY_DOCS = process.env.REACT_APP_DISCOVERY_DOCS;
const SCOPES = process.env.REACT_APP_SCOPES;

  export function initClient(callback: (arg0: boolean) => void) {
    console.log(process.env.REACT_APP_CALENDAR_API_KEY);
    gapi.load('client:auth2',()=>{ 
        try {
            gapi.client.init({
                apiKey: CALENDAR_API_KEY,
                clientId: CLIENT_ID,
                // discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
            }).then(function (resolution) {
                if (typeof(callback)==='function'){
                    callback(true)
                    console.log(resolution);
                }
            }, function(error) {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

export const checkSignInStatus =async () =>{
  try {
    let status = await gapi.auth2.getAuthInstance().isSignedIn.get();
    return status;
} catch (error) {
      console.log(error);
  }
}

export const signInToGoogle = async ()=>{
  try {
      let googleuser = await gapi.auth2.getAuthInstance().signIn({prompt:'consent'});
      console.log('loaded');
      if (googleuser){
          return true;
      }
  } catch (error) {
      console.log(error)
  }
};

export const signOutFromGoogle = () => {
  try {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
          auth2.disconnect();
      });
      return true;
  } catch (error) {
      console.log(error)
  }
}

export const getSignedInUserEmail = async () => {
  try {
      let status = await checkSignInStatus();
       
       if (status){
          
          var auth2 = gapi.auth2.getAuthInstance();
          var profile = auth2.currentUser.get().getBasicProfile();
          return profile.getEmail()
      } else {
          return null;
      }
  } catch (error) {
      console.log(error)
  }
}

export const publishTheCalenderEvent = (googleCalEvent: any) => {
  try {
      gapi.client.load('calendar', 'v3', () => {
        console.log('loaded!')
          const request = gapi.client.calendar.events.insert({
              'calendarId': "primary",
              'resource': googleCalEvent,
          });
          console.log(request, 'inserted event')
          request.execute(function(event) {
            console.log(event)
            window.open('Event created: ' + event.result.htmlLink);
          })
      })   
  }  catch (error) {
      console.log(error, 'insert error')
   }
}


