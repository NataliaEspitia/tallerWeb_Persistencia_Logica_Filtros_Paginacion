import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MuseumService } from './museum.service';
import { MuseumEntity } from './museum.entity';
import { MuseumDto } from './dto/museum.dto';

@Controller('museums')
export class MuseumController {
  constructor(private readonly museumService: MuseumService) {}

  @Post()
  create(@Body() museum: MuseumEntity) {
    return this.museumService.create(museum);
  }

  @Get()
  findAll(@Query() query: MuseumDto) {
    return this.museumService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.museumService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() museum: MuseumEntity) {
    return this.museumService.update(id, museum);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.museumService.delete(id);
  }
}
