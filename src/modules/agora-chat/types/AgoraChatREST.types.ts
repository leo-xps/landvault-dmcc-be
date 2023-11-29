export interface IAgoraCoreResponseFormat {
  action: string;
  path: string;
  uri: string;
  timestamp: number;
  duration: number;
}

export interface IAgoraRegisterUserResponse extends IAgoraCoreResponseFormat {
  application: string;
  entities: {
    uuid: string;
    type: string;
    created: number;
    modified: number;
    username: string;
    activated: boolean;
    nickname: string;
  }[];
  organization: string;
  applicationName: string;
}

export interface IAgoraQueryUserResponse extends IAgoraCoreResponseFormat {
  entities: {
    uuid: string;
    type: string;
    created: number;
    modified: number;
    username: string;
    activated: boolean;
    nickname: string;
  }[];
  timestamp: number;
  duration: number;
  count: number;
}

export interface IAgoraChatRoomResponse {
  data: {
    id: string;
  };
}

export interface IAgoraChatRoomCoreResponseFormat {
  action: string;
  application: string;
  applicationName: string;
  timestamp: number;
  duration: number;
  organization: string;
  uri: string;
  entities: string[];
  data: {
    success: string;
    id: string;
  };
}

export type IAgoraChatDeleteRoomResponseFormat =
  IAgoraChatRoomCoreResponseFormat;

export interface IAgoraChatGetRoomsResponseFormat
  extends IAgoraChatRoomCoreResponseFormat {
  count: number;
}
