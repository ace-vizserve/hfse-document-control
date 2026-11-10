import Control from './Control';
import {access} from '../access';
import AccessNotice from '../AccessNotice';
export const dynamic='force-dynamic';
export default async function Page(){const {canControl}=await access();if(!canControl)return <AccessNotice kind="restricted" title="Restricted access" message="Document Control is available only to authorised administrators."/>;return <Control/>;}
