// utils/clearSearch.ts

interface ClearSearchParams {
  setKeyword?: React.Dispatch<React.SetStateAction<string>>;
  setPriority?: React.Dispatch<React.SetStateAction<string>>;
  setDate?: React.Dispatch<React.SetStateAction<string | string>>;
  setShowPriority?: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDatePicker?: React.Dispatch<React.SetStateAction<boolean>>;
  onClear?: () => void;
}

export const clearSearch = ({
  setKeyword,
  setPriority,
  setDate,
  setShowPriority,
  setShowDatePicker,
  onClear,
}: ClearSearchParams) => {
  setKeyword?.(""); // gọi nếu có
  setPriority?.("");
  setDate?.("");
  setShowPriority?.(false);
  setShowDatePicker?.(false);
  onClear?.(); // gọi nếu có
};
