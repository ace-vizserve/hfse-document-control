import {getCurrentUser} from './current-user';
const controllers=['jill.sulit@hfse.edu.sg','ace.guevarra@vizserve.hfse.edu.sg','kurt.arciga@vizserve.hfse.edu.sg'];
export async function access(){const user=await getCurrentUser();return {user,canControl:!!user&&controllers.includes(user.email.toLowerCase())};}
