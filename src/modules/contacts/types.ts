import * as faker from 'faker';
import {getRandomStr} from "../../utils/stringHelpers";

const uuid = require('uuid/v4');

export interface IPerson {
    salutation: string,
    firstName: string
    lastName: string
    middleName: string
    about: string
    gender: string
    civilStatus: string
    avatar: string
    dateOfBirth: Date
}

export interface IEmail {
    id?: string
    value: string
    category: string
    isPrimary: boolean
}

export enum IdentificationCategory
{
    Nin = 'Nin',
    Passport = 'Passport',
    DrivingPermit = 'DrivingPermit',
    VillageCard = 'VillageCard',
    Nssf = 'Nssf',
    Other = 'Other'
}

export enum CivilStatus
{
    Other = 'Other',
    Single = 'Single',
    Married = 'Married',
    Divorced = 'Divorced'
}

export enum Gender {
    Male = 'Male',
    Female = 'Female',
}

export enum PhoneCategory {
    Mobile = "Mobile",
    Office = "Office",
    Home = "Home",
    Fax = "Fax",
    Other = "Other"
}
export enum EmailCategory {
    Work = 'Work',
    Personal = 'Personal',
    Other = 'Other',
}

export interface IPhone {
    id?: string
    value: string
    category: string
    isPrimary: boolean
}

export interface IIdentification {
    id?: string
    value: string
    cardNumber?: string
    issuingCountry: string
    startDate: Date
    expiryDate: Date
    category: string
    isPrimary: boolean
}

export interface IContactEvent {
    id: string
    value: string
    category: string
}

export interface IAddress {
    id?: string
    category: string
    isPrimary: boolean
    country: string
    district: string
    county: string
    subCounty?: string
    village?: string
    parish?: string
    postalCode?: string
    street?: string

    freeForm?: string
    latLon?: string
    placeId?: string
}

export interface ICompany {
    name: string
}

export interface IMetaData {
    churchLocation: string
    cellGroup: string
}

export interface IContact {
    id?: string
    category: string
    person: IPerson
    emails: IEmail[]
    phones: IPhone[]
    events: IContactEvent[]
    addresses: IAddress[]
    identifications: IIdentification[]
    company?: ICompany
    tags?: string[]
    metaData: IMetaData
}

export interface IContactQuery {
    name?: string
    limit?: number
    skip?: number
}


export interface IConsumerLoan {
    id?: string
    lender: string
    amount: number
    interestRate: number
    durationInMonths: number
}

export const fakeLoan = (): IConsumerLoan => {

    return {
        id: uuid(),
        lender: faker.company.companyName(),
        amount: faker.random.number({max: 100, min: 3}) * 1000,
        durationInMonths: faker.random.number(36),
        interestRate: faker.random.number({max: 2000, min: 1100}) / 100,
    }
}

export const fakeContact = (): IContact => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    return {
        id: uuid(),
        category: 'Person',
        person: {
            firstName: firstName,
            middleName: faker.name.lastName(),
            lastName: lastName,
            civilStatus: 'Single',
            salutation: 'Mr',
            dateOfBirth: faker.date.past(),
            about: faker.lorem.sentence(),
            avatar: faker.image.avatar(),
            gender: 'Male'
        },
        phones: [
            {
                id: uuid(),
                category: 'Mobile',
                isPrimary: false,
                value: faker.phone.phoneNumber('077#######')
            },
            {
                id: uuid(),
                category: 'Office',
                isPrimary: false,
                value: faker.phone.phoneNumber('031#######')
            }
        ],

        emails: [
            {
                id: uuid(),
                category: 'Personal',
                isPrimary: false,
                value: faker.internet.email(firstName, lastName)
            }
        ],
        addresses: [
            {
                id: uuid(),
                category: 'Home',
                isPrimary: false,
                country: faker.address.country(),
                district: faker.address.city(),
                county: faker.address.city()
            }
        ],
        identifications: [
            {
                id: uuid(),
                category: 'Nin',
                value: getRandomStr(),
                cardNumber: getRandomStr(5),
                startDate: faker.date.past(),
                expiryDate: faker.date.future(),
                issuingCountry: 'Uganda',
                isPrimary: true,
            }
        ],
        events: [],
        metaData: {
            cellGroup: '',
            churchLocation: '',
        }
    };
};


export const renderName = (person: IPerson, salutation?: boolean): string => {
    const name: string =
        salutation ?
            `${person.salutation || ''} ${person.firstName || ''} ${person.middleName || ''} ${person.lastName || ''}`
            : `${person.firstName || ''} ${person.middleName || ''} ${person.lastName || ''}`;

    return name.trim().replace(/\s+/g, ' ');
};

export const renderName1 = (person: IPerson): string => {
    const name= `${person.firstName || ''} ${person.middleName || ''} ${person.lastName || ''}`;
    return name.trim().replace(/\s+/g, ' ');
};

export const printAddress = (data: IAddress): string => {
    const address: string =
        `${data.street || ''} ${data.parish || ''} ${data.district || ''} ${data.country || ''}`
    return address.trim().replace(/\s+/g, ' ');
};

export const getPhone = (data: IContact): string => {
    const {phones} = data
    if (phones && phones.length > 0) {
        const pri = phones.find(it => it.isPrimary)
        if (pri)
            return pri.value
        else return phones[0].value
    }
    return "";
};

export const getPhoneObj = (data: IContact): IPhone => {
    const {phones} = data
    if (phones && phones.length > 0) {
        const pri = phones.find(it => it.isPrimary)
        if (pri)
            return pri
        else return phones[0]
    }
    return {} as IPhone;
};

export const getEmail = (data: IContact): string => {
    const {emails} = data
    if (emails && emails.length > 0) {
        const pri = emails.find(it => it.isPrimary)
        if (pri)
            return pri.value
        else return emails[0].value
    }
    return "";
};

export const getEmailObj = (data: IContact): IEmail => {
    const {emails} = data
    if (emails && emails.length > 0) {
        const pri = emails.find(it => it.isPrimary)
        if (pri)
            return pri
        else return emails[0]
    }
    return {} as IEmail;
};

export const getNinObj = (data: IContact): IIdentification => {
    const {identifications} = data
    if (identifications && identifications.length > 0) {
        const pri = identifications.find(it => it.isPrimary)
        if (pri)
            return pri
        else return identifications[0]
    }
    return {} as IIdentification;
};
export const getNin = (data: IContact): string => {
    const {identifications} = data
    if (identifications && identifications.length > 0) {
        const pri = identifications.find(it => it.isPrimary)
        if (pri)
            return pri.value
        else return identifications[0].value
    }
    return "";
};

export const getAddress = (data: IContact): IAddress | {} => {
    const {addresses} = data
    if (addresses && addresses.length > 1) {
        const pri = addresses.find(it => it.isPrimary)
        if (pri)
            return pri
        else return addresses[0]
    }
    return {};
};

