    import bcrypt from "bcrypt";
    import { AppError } from "../../utils/error";
    import { AuthRepository } from "./repository";
    import type { LoginDto } from "./types";
    import { prisma } from "../../config/prisma";

    export class AuthService{

    private repo=new AuthRepository();

    async login(data:LoginDto){

    const user=
    await this.repo.findByEmail(
    data.email
    );

    if(!user){

    throw new AppError(
    401,
    "Invalid credentials"
    );

    }

    const match=
    await bcrypt.compare(
    data.password,
    user.password
    );

    if(!match){

    throw new AppError(
    401,
    "Invalid credentials"
    );

    }

    return user;

    }

    async getUsers(){

    return prisma.user.findMany({

    select:{

    id:true,

    email:true,

    role:true,

    createdAt:true,

    }

    });

    }

    }