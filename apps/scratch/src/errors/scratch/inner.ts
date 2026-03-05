import { ScratchInnerError } from "./base";
import { ScratchProjectErrorCode } from "./codes";

export class InvalidZipError extends ScratchInnerError {
  constructor() {
    super(ScratchProjectErrorCode.InvalidZip, "Failed to load ZIP file");
  }
}

export class MissingProjectJsonError extends ScratchInnerError {
  constructor() {
    super(
      ScratchProjectErrorCode.MissingProjectJson,
      "project.json not found in ZIP file",
    );
  }
}

export class InvalidProjectJsonError extends ScratchInnerError {
  constructor() {
    super(
      ScratchProjectErrorCode.InvalidProjectJson,
      "project.json is invalid JSON",
    );
  }
}

export class MissingAssetsError extends ScratchInnerError {
  constructor(public missingAssets: string[]) {
    super(
      ScratchProjectErrorCode.MissingAssets,
      `Project is missing ${missingAssets.length} assets`,
    );
  }
}

export class VmLoadError extends ScratchInnerError {
  constructor() {
    super(
      ScratchProjectErrorCode.VmLoadError,
      "Scratch VM failed to load project",
    );
  }
}

export class CrtConfigParseError extends ScratchInnerError {
  constructor() {
    super(
      ScratchProjectErrorCode.CrtConfigParseError,
      "crt.json is not valid JSON",
    );
  }
}
