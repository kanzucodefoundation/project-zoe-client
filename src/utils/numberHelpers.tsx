import React from "react";
import { hasNoValue } from "../components/inputs/inputHelpers";

export const printMoney = (money: number) => {
  try {
    if (hasNoValue(money)) return "";
    return money ? (
      <span>
        UGX&nbsp;
        {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
          money
        )}
      </span>
    ) : (
      ""
    );
  } catch (e) {
    return "";
  }
};

export const printNumber = (number: any) => {
  try {
    if (hasNoValue(number)) return "";
    return number ? new Intl.NumberFormat().format(number) : "";
  } catch (e) {
    return "";
  }
};

export const printDecimal = (number: number) => {
  try {
    if (hasNoValue(number)) return "";
    return number
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
          number
        )
      : "";
  } catch (e) {
    return "";
  }
};

export const printInteger = (number: number) => {
  try {
    if (hasNoValue(number)) return "";
    return number
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
          number
        )
      : "";
  } catch (e) {
    return "";
  }
};
