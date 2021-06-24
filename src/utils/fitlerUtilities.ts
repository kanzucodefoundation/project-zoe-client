import { ComboValue } from "../components/plain-inputs/PComboInput";
import { cleanComboValue } from "./dataHelpers";
import * as React from "react";
import { useState } from "react";
import { hasValue } from "../components/inputs/inputHelpers";

export function useFilter({
  initialData,
  onFilter: rawFilter,
  comboFields,
}: {
  initialData: any;
  onFilter: (data: any) => any;
  comboFields?: string[];
}) {
  // Clean up residue data
  const onFilter = (data: any) => {
    const filter = { ...data };
    if (comboFields && hasValue(comboFields)) {
      for (const comboField of comboFields) {
        filter[comboField] = cleanComboValue(filter[comboField]);
      }
      rawFilter(filter);
    } else rawFilter(data);
  };

  const [data, setData] = useState(initialData);
  const handleTextChange = (name: string, event: React.ChangeEvent<any>) => {
    setData({ ...data, [name]: event.target.value });
    onFilter({ ...data, [name]: event.target.value });
  };

  const handleDateChange = (name: string, value: Date | null) => {
    setData({ ...data, [name]: value?.toDateString() });
    onFilter({ ...data, [name]: value?.toDateString() });
  };

  const handleComboChange = (name: string, value: ComboValue) => {
    setData({ ...data, [name]: value });
    const filterData = { ...data };
    delete filterData[name];
    const finalFilter = { ...filterData, [`${name}[]`]: cleanComboValue(value) };
    onFilter(finalFilter);
  };
  return {
    handleTextChange,
    handleDateChange,
    handleComboChange,
    data,
  };
}
