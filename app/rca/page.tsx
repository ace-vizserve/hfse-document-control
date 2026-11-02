import {access} from '../access';
import RcaMonitor from './RcaMonitor';
export const dynamic='force-dynamic';
export default async function Page(){const {canControl}=await access();return canControl?<RcaMonitor/>:<main className="entry"><h1>Restricted access</h1><p>RCA Monitoring is available to authorised Document Control users. Staff access awaits login configuration.</p><a href="/">Return home</a></main>}
