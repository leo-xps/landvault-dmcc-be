import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RatingService } from '../services/rating.service';
import { ISurveyCreateInput } from '../types/NotesModel.types';

@Controller('survey')
export class RatingController {
  constructor(
    private readonly avaturnService: RatingService,
    private readonly serverAdminToken: ServerTokensService,
  ) {}
  async checkAdminTokenValidity(token: string) {
    return this.serverAdminToken.validateToken(token);
  }

  // get list
  @Get('list')
  @UseGuards(RestAuthGuard)
  async getList(@CurrentUser('id') userId: string) {
    return this.avaturnService.getAllNotes(userId);
  }

  // get by id
  @Get(':id')
  @UseGuards(RestAuthGuard)
  async getById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.avaturnService.getNoteByID(userId, id);
  }

  // create new
  @Post()
  @UseGuards(RestAuthGuard)
  async createNew(
    @CurrentUser('id') userId: string,
    @Body() body: ISurveyCreateInput,
  ) {
    return this.avaturnService.submitNote(userId, body);
  }

  // delete
  @Put(':id/delete')
  @UseGuards(RestAuthGuard)
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.avaturnService.deleteNote(userId, id);
  }

  // delete
  @Post('/reset')
  async resetChatListData(@Headers('lv-srv-adm') srvToken: string) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }
    return this.avaturnService.reset();
  }
}
