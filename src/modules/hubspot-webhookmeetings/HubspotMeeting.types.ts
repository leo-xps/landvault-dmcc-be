export interface CreateMeetingWebhookBody {
  /*
    Based of this:
    "portalId": 123123, The hubspot account
    "userId": 123, // user id that created the meeting
    "userEmail": "test.user@example.com", // user email that created the meeting
    "topic": "A Test Meeting", // meeting title
    "source": "MEETINGS" // can be MEETINGS or MANUAL
    "startTime": 1534197600000, // meeting start time in milliseconds
    "endTime": 1534201200000 // meeting end time in milliseconds
  */
  portalId: number;
  userId: number;
  userEmail: string;
  topic: string;
  source: 'MEETINGS' | 'MANUAL' | string;
  startTime: number;
  endTime: number;
  invitees: {
    email: string;
    firstName: string;
    lastName: string;
  }[];
}

export interface CreateMeetingResponse {
  /*
    Based of this:
      "conferenceId": "some-unique-id",
      "conferenceUrl": "https://example.com/join",
      "conferenceDetails": "Click here to join: https://example.com/join"
  */
  conferenceId: string; // uniquely created id for each meeting, will be used to update the said meeting later
  conferenceUrl: string; // url to join the meeting, also placed on the location header
  conferenceDetails: string; // plain text invitation message
}

export interface CallbackData {
  /*
    Based of this:
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: req.query.code
  */
  grant_type: 'authorization_code';
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  code: string;
}

export interface CallbackResponse {
  /* 
    Based of this:
    "refresh_token":"6f18f21e-a743-4509-b7fd-1a5e632fffa1"
    "access_token":"CN2zlYnmLBICAQIYgZXFLyCWp1Yoy_9GMhkAgddk-zDc-H_rOad1X2s6Qv3fmG1spSY0Og0ACgJBAAADAIADAAABQhkAgddk-03q2qdkwdXbYWCoB9g3LA97OJ9I"
    "expires_in":1800
  */
  refresh_token: string;
  access_token: string;
  expires_in: number;
}

export interface GetUserDataResponse {
  total: number;
  results: {
    id: string;
    properties: {
      createdate: string;
      hs_object_id: string;
      lastmodifieddate: string;
      room: string;
    };
    createdAt: string;
    updatedAt: string;
    archived: boolean;
  }[];
}
