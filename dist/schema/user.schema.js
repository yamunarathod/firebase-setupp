import { v4 as uuidv4 } from 'uuid';
export var Role;
(function (Role) {
    Role["admin"] = "admin";
    Role["user"] = "Yamuna";
})(Role || (Role = {}));
export class CommonSchema {
    constructor() {
        this.id = "";
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
        this.modifiedBy = Role.user;
    }
}
export function createUser(id, name, email, password, role, phoneNum, bool) {
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
const newUser = createUser(2, "John Doe", "john.doe@example.com", "securepassword123", Role.user, 9876543210, true);
