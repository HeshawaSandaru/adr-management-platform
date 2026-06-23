import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Adr,
  AdrSchema,
} from './schemas/adr.schema';

import { AdrsController } from './adrs.controller';
import { AdrsService } from './adrs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Adr.name,
        schema: AdrSchema,
      },
    ]),
  ],
  controllers: [AdrsController],
  providers: [AdrsService],
  exports: [MongooseModule],
})
export class AdrsModule {}