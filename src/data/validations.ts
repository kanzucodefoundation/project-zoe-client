import * as yup from "yup";
export const invalidInputs = [null, 'null', 'undefined', undefined, '']
export const reqMsg = 'Input is required'
export const nullableString = yup.string().nullable(true)
export const reqString = yup.string().required(reqMsg).notOneOf(invalidInputs, reqMsg)
export const yupString = yup.string().notOneOf(invalidInputs, reqMsg)
export const reqEmail = yup.string().email('Must be a valid email').required("Email is required")
export const email = yup.string().email('Must be a valid email')
export const reqDate = yup.date().required(reqMsg).notOneOf(invalidInputs, reqMsg).nullable(true)
