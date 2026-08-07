import type { FastifyInstance } from "fastify";


import { AuthController } from "./controller";


import { authenticate } from "../../middleware/auth";

import { authorize } from "../../middleware/authorize";



const controller =
new AuthController();




export async function authRoutes(

app:FastifyInstance,

){



// PUBLIC LOGIN

app.post(

"/login",

controller.login.bind(controller)

);







// ANY LOGGED IN USER

app.get(

"/me",

{

preHandler:[

authenticate

]

},

controller.me.bind(controller)

);








// SUPER ADMIN ONLY

app.get(

"/users",

{

preHandler:[

authenticate,

authorize(
"SUPER_ADMIN"
)

]

},

controller.getUsers.bind(controller)

);



}