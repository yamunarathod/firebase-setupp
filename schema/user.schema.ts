import { v4 as uuidv4 } from 'uuid';
export enum Role {
    admin = "admin",
    user = "Yamuna",
}

export interface schemaStruct {
    id: string;
    createdAt: number;
    updatedAt: number;
    modifiedBy: Role;
}

export class CommonSchema implements schemaStruct {
    id: string;
    createdAt: number;
    updatedAt: number;
    modifiedBy: Role;

    constructor() {
        this.id = "";
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
        this.modifiedBy = Role.user;
    }
}

export interface User extends CommonSchema {
    name: string;
    email: string;
    password: string;
    role: Role;
    phoneNum: number;
    bool: boolean;
}

export function createUser(id:number, name: string, email: string, password: string, role: Role, phoneNum: number, bool: boolean): User {
    return {
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        modifiedBy: Role.user,
        name,
        email,
        password,
        role,
        phoneNum,
        bool,
    };
}

const newUser = createUser(2,"John Doe", "john.doe@example.com", "securepassword123", Role.user, 9876543210, true);
