import {getChatGPTUser} from './chatgpt-auth';
const controllers=['jill.sulit@hfse.edu.sg','ace.guevarra@vizserve.hfse.edu.sg'];
export async function access(){const user=await getChatGPTUser();return {user,canControl:!!user&&controllers.includes(user.email.toLowerCase())};}
