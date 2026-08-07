import {
  FastifyReply,
  FastifyRequest,
} from "fastify";
export function authorize(

roles:string[]

){

return async(

request:any,

reply:any

)=>{

if(

!roles.includes(

request.user.role

)

){

return reply.code(403).send({

success:false,

message:"Forbidden"

});

}

};

return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const user = request.user as {
      role: string;
    };

    if (!roles.includes(user.role)) {
      return reply.code(403).send({
        success: false,
        message: "Forbidden",
      });
    }
  };

}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
}