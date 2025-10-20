import { DeletedBlockRecord } from "../../scratch-block";

export const shouldTrackDeleteBlock = (block: DeletedBlockRecord): boolean => {
  if (!block) return false;

  return true;
};
