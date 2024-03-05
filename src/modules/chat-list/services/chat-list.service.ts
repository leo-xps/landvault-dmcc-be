import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ChatListService {
  constructor(
    private readonly db: DbService,
    private readonly i18n: I18nService,
  ) {}

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

  // get
  async getChatListData(chatID: string) {
    const chatHistory = await this.db.chatHistory.findFirst({
      where: {
        roomID: chatID,
      },
    });

    return chatHistory?.data;
  }
}
