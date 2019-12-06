import * as faker from 'faker';
import {GroupPrivacy, IGroup} from "./types";

const uuid = require('uuid/v1');

export const createNode = (parent: string | null = null): IGroup => ({
    id: uuid(),
    name: faker.company.catchPhrase(),
    parent,
    description: faker.company.catchPhrase(),
    privacy: GroupPrivacy.Public,
    tag: "Location"
});



