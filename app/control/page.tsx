import Control from './Control';
import {access} from '../access';
export const dynamic='force-dynamic';
export default async function Page(){const {canControl}=await access();if(!canControl)return <main className="entry"><h1>Restricted access</h1><p>Document Control is available only to authorised administrators.</p><a href="/">Return to home</a></main>;return <Control/>;}
