import React from "react"

export const printMoney = (money: number) => {
    try {
        return money ? <span>
                UGX&nbsp;
            {new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(money)}
            </span> : ""
    } catch (e) {
        return ''
    }
}

export const printNumber = (number: number) => {
    try {
        return number ? new Intl.NumberFormat().format(number) : ''
    } catch (e) {
        return ''
    }
}

export const printDecimal = (number: number) => {
    try {
        return number ? new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(number) : ''
    } catch (e) {
        return ''
    }
}

export const printInteger = (number: number) => {
    try {
        return number ? new Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(number) : ''
    } catch (e) {
        return ''
    }
}
