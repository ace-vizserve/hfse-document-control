import {access} from '../../access';
import RestrictedPanel from '../_shell/RestrictedPanel';
import RcaMonitor from './RcaMonitor';
export const dynamic='force-dynamic';
export default async function Page(){const {canControl}=await access();if(!canControl)return <RestrictedPanel message="RCA Monitoring is available to authorised Document Control users. Staff access awaits login configuration."/>;return <RcaMonitor/>;}
