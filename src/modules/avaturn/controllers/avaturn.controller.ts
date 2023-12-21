import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AvaturnService } from '../services/avaturn.service';
import { IAvaturnModelCreateInput } from '../types/AvaturnModel.types';

@Controller('avaturn')
export class AvaturnController {
  constructor(private readonly rpmService: AvaturnService) {}

  // get default
  @Get()
  @UseGuards(RestAuthGuard)
  async getDefault(@CurrentUser('id') userId: string) {
    return this.rpmService.getDefaultModel(userId);
  }

  // get list
  @Get('list')
  @UseGuards(RestAuthGuard)
  async getList(@CurrentUser('id') userId: string) {
    return this.rpmService.getAllModels(userId);
  }

  // create new
  @Post()
  @UseGuards(RestAuthGuard)
  async createNew(
    @CurrentUser('id') userId: string,
    @Body() body: IAvaturnModelCreateInput,
  ) {
    return this.rpmService.createModel(userId, body);
  }

  // update
  @Put(':id/update')
  @UseGuards(RestAuthGuard)
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: IAvaturnModelCreateInput,
  ) {
    return this.rpmService.updateModel(userId, id, body);
  }

  // delete
  @Put(':id/delete')
  @UseGuards(RestAuthGuard)
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.rpmService.deleteModel(userId, id);
  }

  // set default
  @Put(':id/set-default')
  @UseGuards(RestAuthGuard)
  async setDefault(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.rpmService.setModelAsDefault(userId, id);
  }
}
