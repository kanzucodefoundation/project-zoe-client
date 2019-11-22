import * as faker from 'faker';
const uuid = require('uuid/v4');
export const tagCategories = ['Group', 'Person', 'Task']
export interface ITag {
    name: string
    id: string
    category: string
    color: string
}


export const fakeTag = (): ITag => {
    return {
        id: uuid(),
        category: 'Group',
        color: 'red',
        name: faker.company.bsBuzz(),
    }
}
