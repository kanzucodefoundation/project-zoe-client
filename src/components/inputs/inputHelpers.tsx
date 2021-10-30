import React from "react";
import { isEmpty, isNumber } from "lodash";
import XTextInput from "./XTextInput";
import { IColumn, InputType } from "../dynamic-editor/types";
import XDateInput from "./XDateInput";
import XRadioInput from "./XRadioInput";
import XSelectInput from "./XSelectInput";
import XTextAreaInput from "./XTextAreaInput";

export interface IOption {
  name: string;
  id: any;
}

export const toOptions = (data: string[]): IOption[] => {
  return data.map((it) => ({ name: it, id: it }));
};
export const toOption = (data: any[]): IOption[] => {
 return data.map((it:any) => ({name: it["name"], id: it["id"]}));

};
export const comboParser = ({ id, name }: any): IOption => ({ id, name });

export const hasValue = (text: any) => {
  return !hasNoValue(text);
};

export const hasNoValue = (text: any) => {
  if (isNumber(text)) return false;
  return isEmpty(text);
};

export const renderInput = ({
  inputType,
  name,
  label,
  inputProps,
  ...rest
}: IColumn) => {
  if (inputType) {
    const type: InputType = inputType;
    const inputProperties = { name, label, ...inputProps };
    switch (type) {
      case InputType.Text:
        return <XTextInput {...inputProperties} />;
      case InputType.Date:
        return <XDateInput {...inputProperties} />;
      case InputType.Radio:
        return <XRadioInput {...inputProperties} />;
      case InputType.TextArea:
        return <XTextAreaInput {...inputProperties} />;
      case InputType.Select:
        return <XSelectInput {...inputProperties} />;
      default:
        return <XTextInput {...inputProperties} />;
    }
  }
};
