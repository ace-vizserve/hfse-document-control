import {access} from '../access';
import AccessNotice from '../AccessNotice';
import RcaMonitor from './RcaMonitor';
export const dynamic='force-dynamic';
export default async function Page(){const {canControl}=await access();return canControl?<RcaMonitor/>:<AccessNotice kind="restricted" title="Restricted access" message="RCA Monitoring is available to authorised Document Control users. Staff access awaits login configuration."/>}
