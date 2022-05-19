const { gapi } = window;
const CALENDAR_API_KEY = process.env.REACT_APP_CALENDAR_API_KEY;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const DISCOVERY_DOCS = process.env.REACT_APP_DISCOVERY_DOCS;
const SCOPES = process.env.REACT_APP_SCOPES;

const DISCOVERY_DOCS_RESPONSE = (DISCOVERY_DOCS) || '';

const DOCS_ARRAY:string[] = [];
DOCS_ARRAY.push(DISCOVERY_DOCS_RESPONSE);

export function initClient(callback: (arg0: boolean) => void) {
  gapi.load('client:auth2', () => {
    try {
      gapi.client.init({
        apiKey: CALENDAR_API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DOCS_ARRAY,
        scope: SCOPES,
      }).then((resolution) => {
        if (typeof (callback) === 'function') {
          callback(true);
          console.log(resolution);
        }
      }, (error) => {
        console.log(error);
      });
    } catch (error) {
      console.log(error);
    }
  });
}

export const checkSignInStatus = async () => {
  try {
    const status = await gapi.auth2.getAuthInstance().isSignedIn.get();
    return status;
  } catch (error) {
    console.log(error);
  }
};

export const signInToGoogle = async () => {
  try {
    const googleuser = await gapi.auth2.getAuthInstance().signIn({ prompt: 'consent' });
    console.log('loaded');
    if (googleuser) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};

export const signOutFromGoogle = () => {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      auth2.disconnect();
    });
    return true;
  } catch (error) {
    console.log(error);
  }
};

export const getSignedInUserEmail = async () => {
  try {
    const status = await checkSignInStatus();

    if (status) {
      const auth2 = gapi.auth2.getAuthInstance();
      const profile = auth2.currentUser.get().getBasicProfile();
      return profile.getEmail();
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};

export const publishTheCalenderEvent = (googleCalEvent: any) => {
  try {
    gapi.client.load('calendar', 'v3', () => {
      console.log('loaded!');
      const request = gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: googleCalEvent,
      });
      console.log(request, 'inserted event');
      request.execute((event) => {
        console.log(event);
        // window.open('Event created: ' + event)
      });
    });
  } catch (error) {
    console.log(error, 'insert error');
  }
};
