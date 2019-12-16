import {IAddress, IContact, IEmail, IIdentification, IPerson, IPhone} from "../../modules/contacts/types";

export const crmConstants = {
    crmFetchAll: "crmFetchAll",
    crmFetchLoading: "crmFetchLoading",
    crmFetchOne: "crmFetchOne",

    crmAddContact: "crmAddContact",

    crmEditPerson: "crmEditPerson",

    crmAddEmail: "crmAddEmail",
    crmEditEmail: "crmEditEmail",
    crmDeleteEmail: "crmDeleteEmail",

    crmAddPhone: "crmAddPhone",
    crmEditPhone: "crmEditPhone",
    crmDeletePhone: "crmDeletePhone",

    crmAddAddress: "crmAddAddress",
    crmEditAddress: "crmEditAddress",
    crmDeleteAddress: "crmDeleteAddress",

    crmAddIdentification: "crmAddIdentification",
    crmEditIdentification: "crmEditIdentification",
    crmDeleteIdentification: "crmDeleteIdentification",

    coreLogout: "CORE_LOGOUT"
}

export interface ICrmState {
    data: IContact[]
    selected?: IContact
    loading: boolean
}

const initialState: ICrmState = {
    data: [],
    loading: true,
    selected: undefined
}

export default function reducer(state = initialState, action: any) {
    switch (action.type) {
        case crmConstants.crmFetchAll: {
            const data: IContact[] = action.payload
            return {...state, data, loading: false,}
        }

        case crmConstants.crmFetchLoading: {
            return {...state, loading: action.payload}
        }

        case crmConstants.crmAddContact: {
            const newContact: IContact[] = action.payload
            return {...state, data: [...state.data, newContact]}
        }

        case crmConstants.crmEditPerson: {
            const person: IPerson = action.payload
            if (state.selected) {
                const selected: IContact = {...state.selected, person}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmFetchOne: {
            const selected: IContact = action.payload
            return {...state, selected}
        }

        case crmConstants.crmAddEmail: {
            const email: IEmail = action.payload
            if (state.selected) {
                const {emails, ...rest} = state.selected
                const selected: IContact = {...rest, emails: [...emails, email]}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmEditEmail: {
            const email: IEmail = action.payload
            if (state.selected) {
                const {emails: oldEmails, ...rest} = state.selected
                const emails = oldEmails.map(it => it.id === email.id ? email : it)
                const selected: IContact = {...rest, emails}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmDeleteEmail: {
            const id: string = action.payload
            if (state.selected) {
                const {emails, ...rest} = state.selected
                const selected: IContact = {...rest, emails: emails.filter(it => it.id === id)}
                return {...state, selected}
            }
            return state
        }
        case crmConstants.crmAddPhone: {
            const phone: IPhone = action.payload
            if (state.selected) {
                const {phones, ...rest} = state.selected
                const selected: IContact = {...rest, phones: [...phones, phone]}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmEditPhone: {
            const phone: IPhone = action.payload
            if (state.selected) {
                const {phones: oldPhones, ...rest} = state.selected
                const phones = oldPhones.map(it => it.id === phone.id ? phone : it)
                const selected: IContact = {...rest, phones}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmDeletePhone: {
            const id: string = action.payload
            if (state.selected) {
                const {phones, ...rest} = state.selected
                const selected: IContact = {...rest, phones: phones.filter(it => it.id === id)}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmAddIdentification: {
            const identification: IIdentification = action.payload
            if (state.selected) {
                const {identifications, ...rest} = state.selected
                const selected: IContact = {...rest, identifications: [...identifications, identification]}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmEditIdentification: {
            const identification: IIdentification = action.payload
            if (state.selected) {
                const {identifications: oldIdentifications, ...rest} = state.selected
                const identifications = oldIdentifications.map(it => it.id === identification.id ? identification : it)
                const selected: IContact = {...rest, identifications}
                return {...state, selected}
            }
            return state
        }
        case crmConstants.crmDeleteIdentification: {
            const id: string = action.payload
            if (state.selected) {
                const {identifications, ...rest} = state.selected
                const selected: IContact = {...rest, identifications: identifications.filter(it => it.id === id)}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmAddAddress: {
            const address: IAddress = action.payload
            if (state.selected) {
                const {addresses, ...rest} = state.selected
                const selected: IContact = {...rest, addresses: [...addresses, address]}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmEditAddress: {
            const address: IAddress = action.payload
            if (state.selected) {
                const {addresses: oldAddresses, ...rest} = state.selected
                const addresses = oldAddresses.map(it => it.id === address.id ? address : it)
                const selected: IContact = {...rest, addresses}
                return {...state, selected}
            }
            return state
        }

        case crmConstants.crmDeleteAddress: {
            const id: string = action.payload
            if (state.selected) {
                const {addresses, ...rest} = state.selected
                const selected: IContact = {...rest, addresses: addresses.filter(it => it.id === id)}
                return {...state, selected}
            }
            return state
        }

        default: {
            return state
        }
    }
}
