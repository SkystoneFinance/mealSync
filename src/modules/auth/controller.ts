import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";


import { validate } from "../../plugins/zod";

import { loginSchema } from "./schema";

import { AuthService } from "./service";

import type { LoginDto } from "./types";

import { adminTokenPayload } from "./tokens";



export class AuthController {


  private readonly service =
    new AuthService();



  // LOGIN
  async login(

    request: FastifyRequest<{
      Body: LoginDto;
    }>,

    reply: FastifyReply,

  ) {


    const body =
      await validate(
        loginSchema,
        request.body,
      );



    const user =
      await this.service.login(body);



    const token =
      request.server.jwt.sign(
        adminTokenPayload(user),
      );


    // Never send the password hash to the client
    const { password: _password, ...safeUser } =
      user;


    return reply.send({

      success:true,

      token,

      user:safeUser,

    });


  }



  // REFRESH SESSION (sliding expiry)
  async refresh(

    request:FastifyRequest,

    reply:FastifyReply

  ){


    const payload =
      await this.service.refresh(
        request.user,
      );


    const token =
      request.server.jwt.sign(payload);


    return reply.send({

      success:true,

      token,

    });


  }





  // GET CURRENT USER
  async me(

    request:FastifyRequest,

    reply:FastifyReply

  ){


    const user =
      request.user;



    return reply.send({

      success:true,

      user,

    });


  }






  // SUPER ADMIN GET ALL USERS
  async getUsers(

    request:FastifyRequest,

    reply:FastifyReply

  ){


    const users =
      await this.service.getUsers();



    return reply.send({

      success:true,

      data:users,

    });


  }


}