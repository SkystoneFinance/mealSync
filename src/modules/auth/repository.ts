import { prisma } from "../../config/prisma";

export class AuthRepository{

  findByEmail(email:string){

    // cast prisma to any to avoid TS error when generated client typings are unavailable
    return (prisma as any).user.findUnique({

      where:{email},

      include:{
        staff:true
      }

    });

  }

}