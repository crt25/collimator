import { useLocalStorage } from "./useLocalStorage";

type AnonymizationState = {
  showActualName: boolean;
};

export const useStudentAnonymization = (): [
  AnonymizationState,
  (value: AnonymizationState) => void,
] =>
  useLocalStorage<AnonymizationState>("anonymization", {
    showActualName: false,
  });
