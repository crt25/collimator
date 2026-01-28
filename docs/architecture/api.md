# API reference

The NestJS backend follows OpenAPI principes and is documented directly in the code.

The generated OpenAPI specification is then used by Orval to generate a REST client for the Next.js frontend.

## OpenAPI / Swagger

The API is defined by controllers and DTOs located in `backend/src/api/` and documented using `@nestjs/swagger`.

For example, the `name` field for user creation is described in `create-user.dto.ts`:

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

This configuration generates an OpenAPI specification that is available at:

- `http://localhost:3001/api` (Swagger UI)
- `http://localhost:3001/api-json` (raw OpenAPI JSON)

## Orval

Orval generates type-safe JavaScript and TypeScript clients from any valid OpenAPI v3 specification.

The command `yarn update:api` in the `frontend` folderThis reads the OpenAPI JSON specification and generates a client in `frontend/api/collimator/generated`.
