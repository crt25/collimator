import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ClassEntity } from "./entities/class.entity";
import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { ClassesService } from "./services/classes.service";

@Controller("classes")
@ApiTags("classes")
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiCreatedResponse({ type: ClassEntity })
  async create(@Body() createClassDto: CreateClassDto): Promise<ClassEntity> {
    return new ClassEntity(await this.classesService.create(createClassDto));
  }

  @Get()
  @ApiOkResponse({ type: ClassEntity, isArray: true })
  async findAll(): Promise<ClassEntity[]> {
    const classes = await this.classesService.findMany({});

    return classes.map((klass) => new ClassEntity(klass));
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ClassEntity })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<ClassEntity> {
    const klass = await this.classesService.update({
      where: { id },
      data: updateClassDto,
    });

    return new ClassEntity(klass);
  }

  @Delete(":id")
  @ApiOkResponse({ type: ClassEntity })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<ClassEntity> {
    return new ClassEntity(await this.classesService.delete({ id }));
  }
}
