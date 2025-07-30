export interface HandleMessageInterface {
  user: string;
  text: string;
}

export interface ResponseHandleDisconnectInterface {
  left: string;
  list: string[];
}

export interface ResponseHandleConnectInterface {
  joined: string;
  list: string[];
}
