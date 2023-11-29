import { throttledPromises } from '@common/utils/throttledPromiseall';
import { AgoraChatRoomService } from '@modules/agora-chat/services/agora-chat-room.service';
import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { XHours } from './cron-agora-delete-chatroom.global';

@Injectable()
export class CronAgoraDeleteChatroomService {
  constructor(
    private readonly agoraChat: AgoraChatRoomService,
    private readonly db: DbService,
  ) {}

  // This auto deletes rooms that have not been checked in 3 hours
  @Cron('* 30 * * * *')
  async autoDeleteStaleRooms() {
    const chatRoomsOlderThanXHours = await this.db.agoraChatRoomIDs.findMany({
      where: {
        lastCheckAt: {
          lte: new Date(Date.now() - XHours),
        },
      },
    });

    const toProcessRooms = chatRoomsOlderThanXHours.length;
    const processedRooms = [];

    await throttledPromises(
      async (chatRoom) => {
        await this.agoraChat.deleteChatRoom(chatRoom.roomID);
        processedRooms.push(chatRoom);
      },
      chatRoomsOlderThanXHours,
      5,
    );

    await this.db.agoraChatRoomIDs.deleteMany({
      where: {
        id: {
          in: chatRoomsOlderThanXHours.map((x) => x.id),
        },
      },
    });

    console.log(
      `CronAgoraDeleteChatroomService: Processed ${toProcessRooms} rooms, deleted ${processedRooms.length} rooms`,
    );
  }
}
