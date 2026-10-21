    import bcrypt from "bcrypt";
    import { AppError } from "../../utils/error";
    import { AuthRepository } from "./repository";
    import type { LoginDto } from "./types";
    import { prisma } from "../../config/prisma";
    import { adminTokenPayload, staffTokenPayload } from "./tokens";

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

    // ==========================================
    // REFRESH SESSION
    // Re-checks the account in the database so a deactivated
    // user can't keep renewing an old token.
    // ==========================================

    async refresh(tokenUser:{ id:string; staffId?:string; role:string }){

    // STAFF TOKEN
    if(tokenUser.staffId){

    const staff=
    await prisma.staff.findUnique({
    where:{ id:tokenUser.staffId },
    include:{ user:true },
    });

    if(
    !staff ||
    !staff.isActive ||
    !staff.user ||
    !staff.user.isActive ||
    !staff.user.password
    ){
    throw new AppError(
    401,
    "Session is no longer valid. Please login again."
    );
    }

    return staffTokenPayload(staff);

    }

    // ADMIN TOKEN
    const user=
    await prisma.user.findUnique({
    where:{ id:tokenUser.id },
    });

    if(!user || !user.isActive){
    throw new AppError(
    401,
    "Session is no longer valid. Please login again."
    );
    }

    return adminTokenPayload(user);

    }

    }