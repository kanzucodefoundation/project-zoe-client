import { ComboValue } from "../components/plain-inputs/PComboInput";
import { cleanComboValue } from "./dataHelpers";

const hasSingleElement = (v: any) => {
  return Array.isArray(v) && v.length === 1;
};

export const handleComboChange = (
  name: string,
  setData: any,
  data: any,
  onFilter: any,
  value: ComboValue
) => {
  console.log("ComboValue", value);
  console.log("ComboValueClean", cleanComboValue(value));
  setData({ ...data, [name]: value });
  const filterName = hasSingleElement(value) ? `${name}[]` : name;
  const filterData = { ...data };
  delete filterData[filterName];
  delete filterData[name];
  const finalFilter = { ...filterData, [filterName]: cleanComboValue(value) };
  onFilter(finalFilter);
  console.log("finalFilter>>>>", finalFilter);
};

export const handleDateChange = (
  name: string,
  setData: any,
  data: any,
  onFilter: any,
  value: Date | null
) => {
  setData({ ...data, [name]: value?.toISOString() });
  onFilter({ ...data, [name]: value?.toISOString() });
};
