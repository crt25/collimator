import { Module } from "@nestjs/common";
import { AstConversionService } from "./ast-conversion.service";

@Module({
  imports: [],
  providers: [AstConversionService],
  exports: [AstConversionService],
})
export class AstModule {}
