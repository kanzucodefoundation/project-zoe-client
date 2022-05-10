import * as yup from "yup";

export const invalidInputs = [null, 'null', 'undefined', undefined, '']
export const reqMsg = 'Input is required'

export const reqString = yup.string().required(reqMsg).nullable(true)
export const reqObject = yup.object().required(reqMsg).nullable(true)

export const reqArray = yup.array().ensure().required(reqMsg).min(1)
export const ensureArray = yup.array().ensure()

export const reqPositiveInteger = yup.number()
    .required(reqMsg)
    .positive()
    .integer()


export const validateString = yup.string().notOneOf(invalidInputs, reqMsg)

export const reqEmail = yup
    .string()
    .email('Must be a valid email')
    .required("Email is required")

export const validateEmail = yup
    .string()
    .nullable()
    .notRequired()
    .email('Must be a valid email')

export const reqDate = yup.date().required(reqMsg).nullable(true)
