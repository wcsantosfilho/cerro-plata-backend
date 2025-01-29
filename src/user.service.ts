import { Injectable, NotFoundException } from '@nestjs/common';

export type User = {
    id?: number;
    name: string;
    age: number;
    uf: string;
}

@Injectable()
export class UserService {

    nextId: number = 1;
    users: User[] = [];

    getUsers(): User[] {
        return this.users;
    }

    addUser(newUser: User): User {

        newUser.id = this.nextId++;  
        this.users.push(newUser);

        return newUser;
    }

    updateUser(id: number, userData: User): User {

        const index = this.users.findIndex( u => u.id == id);
        if (index < 0) {
            throw new NotFoundException
        }

        const user = this.users[index];
        user.name = userData.name;
        user.age = userData.age;
        user.uf = userData.uf;
        
        this.users[index] = user;

        return userData;
    }

    deleteUser(id: number): User[] {

        const index = this.users.findIndex( u => u.id == id);
        if (index < 0) {
            throw new NotFoundException
        }

        const user = this.users.splice(index, 1);

        return user;
    }

}
