export class GetUserRequest {
  ecs: string;
  pno: string;
  psz: string;
}
export class GetUserInfoByMailRequest {
  email: string;
}

export interface GetUserResponse {
  msg: {
    wsi: string;
    uid: string;
    mcd: number;
    tim: number;
    erc: number;
    ers: string;
    cmd: number;
  };
  dtl: {
    lid: string;
    fnm: string;
    eid: string;
    rid: number;
    mob: string;
  }[];
}
