import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";


const prisma = new PrismaClient();



async function main(){


const password =
await bcrypt.hash(
"123456",
10
);



// SUPER ADMIN

await prisma.user.upsert({

where:{
email:"admin@mealsync.com"
},

update:{},

create:{


email:"admin@mealsync.com",

password,

role:Role.SUPER_ADMIN,


}

});





// ADMIN / CHEF

await prisma.user.upsert({

where:{
email:"chef@mealsync.com"
},

update:{},

create:{


email:"chef@mealsync.com",

password,

role:Role.ADMIN,


}

});






// NORMAL USER

await prisma.user.upsert({

where:{
email:"john@gmail.com"
},

update:{},

create:{


email:"john@gmail.com",

password,

role:Role.USER,


}

});




console.log(
"Test users created successfully"
);


}



main()

.catch((e)=>{

console.error(e);

process.exit(1);

})

.finally(async()=>{

await prisma.$disconnect();

});