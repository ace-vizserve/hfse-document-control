import Control from './Control';
import {access} from '../../access';
import RestrictedPanel from '../_shell/RestrictedPanel';
export const dynamic='force-dynamic';
export default async function Page(){const {canControl}=await access();if(!canControl)return <RestrictedPanel message="Document Control is available only to authorised administrators."/>;return <Control/>;}
