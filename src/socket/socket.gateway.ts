import { OnModuleDestroy } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  HandleMessageInterface,
  ResponseHandleConnectInterface,
  ResponseHandleDisconnectInterface,
} from './interfaces/socket.interface';

type SocketClient = Socket;

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class SocketGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  constructor() {}

  @WebSocketServer()
  public server!: Server;
  public usersConnected: string[] = [];

  afterInit(server: Server): void {
    this.server = server;
  }

  async onModuleDestroy(): Promise<void> {
    await this.server.close();
  }

  handleConnection(client: SocketClient): void {}

  handleDisconnect(client: SocketClient): void {
    const username = client.handshake.query.username;

    this.usersConnected = this.usersConnected.filter(
      (user) => user !== username,
    );

    const resp: ResponseHandleDisconnectInterface = {
      left: String(username),
      list: this.usersConnected,
    };

    this.server.emit('list-update', resp);
  }

  @SubscribeMessage('send-msg')
  handleMensagem(@MessageBody() data: HandleMessageInterface): void {
    this.server.emit('show-msg', data);
  }

  @SubscribeMessage('join-request')
  userConnect(@MessageBody() username: string): void {
    if (this.usersConnected.includes(username)) {
      this.server.emit('user-exists');
    } else {
      const resp: ResponseHandleConnectInterface = {
        joined: String(username),
        list: this.usersConnected,
      };
      this.usersConnected.push(username);
      this.server.emit('user-ok', resp);
      this.server.emit('list-update', resp);
    }
  }
}
