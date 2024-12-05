import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { UsersService } from "src/api/users/users.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("UsersService", () => {
  let service: UsersService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    module.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
