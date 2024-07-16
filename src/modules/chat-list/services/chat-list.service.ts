import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatListService {
  constructor(private readonly db: DbService) {}

  // set
  async setChatListData(chatID: string, data: string) {
    // if chatHistory exists, update it
    const chatHistory = await this.db.chatHistory.findFirst({
      where: {
        roomID: chatID,
      },
    });

    if (chatHistory) {
      return this.db.chatHistory.update({
        where: {
          id: chatHistory.id,
        },
        data: {
          data,
        },
      });
    } else {
      // if chatHistory does not exist, create it
      return this.db.chatHistory.create({
        data: {
          roomID: chatID,
          data,
        },
      });
    }
  }

  async deleteChatListData(chatID: string) {
    // if chatHistory exists, update it
    const chatHistory = await this.db.chatHistory.findFirst({
      where: {
        roomID: chatID,
      },
    });

    if (chatHistory) {
      return this.db.chatHistory.delete({
        where: {
          id: chatHistory.id,
        },
      });
    }
  }

  async resetChatList() {
    return this.db.chatHistory.deleteMany({});
  }

  // get
  async getChatListData(chatID: string) {
    const chatHistory = await this.db.chatHistory.findFirst({
      where: {
        roomID: chatID,
      },
    });

    return chatHistory?.data ?? '';
  }

  // get
  async getChatListAll() {
    const chatHistory = await this.db.chatHistory.findMany({});

    return chatHistory;
  }
}
