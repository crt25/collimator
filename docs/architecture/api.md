# API reference

The NestJS backend uses OpenAPI principes, documented by the code. Then the collected documentation is used by Orval to generate a RESTful client for Next.js frontend.

## OpenAPI / Swagger

The API is described by controllers and DTO in `backend/src/api/` and documented using `@nestjs/swagger`.

As an example, the `name` attribute for user creation is described in `create-user.dto.ts`:

```typescript

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Expose } from "class-transformer";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "John Doe",
    description: "The user's full name (optional).",
    nullable: true,
    type: "string",
  })
  @Expose()
  readonly name!: string | null;

  // ...
```

This way an OpenAPI documentation is built and available at `localhost:3001/api` and `localhost:3001/api-json`.

## Orval

"Orval generates type-safe JS clients (TypeScript) from any valid OpenAPI v3."

With the CLI command `yarn update:api` in the `frontend` folder, the JSON version of the OpenAPI documentation is reading and a client is generated into `frontend/api/collimator/generated`.



