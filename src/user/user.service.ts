import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany();
    }

    async findOne(id: number) {
        return this.prisma.user.findUnique({
            where: { userId: id},
        });
    }

    async create(user: User) {
        return this.prisma.user.create({
            data: user, 
        });
    }

    async update(id: number, user: User) {
        return this.prisma.user.update({
            where: { userId: id },
            data: user,
        });
    }
    
    async delete(id: number) {
        return this.prisma.user.delete({
            where: { userId: id },
        });
    }
}