import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit {

  //initialize web socket server
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('ChatGateway');

  //run after gateway initialization
  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  /**
   * if front-end emit a named event " chatToServer " than this function will be executed
   * Example for emit: this.socket.chat.emit('chatToServer', { sender: this.username, room: this.activeRoom, message: this.text });
   * @param client 
   * @param message 
   */
  @SubscribeMessage('chatToServer')
  handleMessage(socket: Socket, message: { sender: string, room: string, message: string }) {
    // Server emit a named event " chatToClient " to a specific room
    // All clients of this room will listen to this
    // Example for listening : this.socket.chat.on("chatToClient",', (msg) => {
    //                              this.receiveChatMessage(msg);
    //                          })
    this.wss.to(message.room).emit('chatToClient', message);
  }  
  //    ******************** join and leave Room ********************

  /**
   * Room : A room is an arbitrary channel that sockets can join and leave. It can be used to broadcast events to a subset of clients.
   * You can call join to subscribe the socket to a given channel.
   * 
   ********** simply use to or in (they are the same) when broadcasting or emitting:
    1. io.to("room1").to("room2").to("room3").emit("some event");
      In that case, a union is performed: every socket that is at least in one of the rooms will get the event once (even if the socket is in two or more rooms).
    
    2. socket.to("some room").emit("some event");
      In that case, every socket in the room excluding the sender will get the event.
  * @param client 
   * @param room 
   */

  @SubscribeMessage('joinRoom')
  handleRoomJoin(socket: Socket, room: string ) {
    socket.join(room);
    socket.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(socket: Socket, room: string ) {
    socket.leave(room);
    socket.emit('leftRoom', room);
  }

}
