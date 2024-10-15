import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from 'src/classes/services/classes.service';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService]
})
export class ClassesModule {}
