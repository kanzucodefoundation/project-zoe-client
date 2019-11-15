import {IUser} from "../../data/types";
import * as faker from 'faker';

const uuid = require('uuid/v4');

export const fakeUser = (): IUser => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    return {
        id: uuid(),
        avatar: faker.internet.avatar(),
        username: firstName,
        email: faker.internet.email(firstName, lastName),
        fullName: `${firstName} ${lastName}`,
        roles: ["Admin", "Fuller"]
    }
}
