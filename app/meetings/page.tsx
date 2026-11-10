import {access} from '../access';
import AccessNotice from '../AccessNotice';
import Meetings from './Meetings';
export const dynamic='force-dynamic';
export default async function Page(){const {user,canControl}=await access();return user?<Meetings controller={canControl} email={user.email}/>:<AccessNotice kind="signin" title="Sign-in required" message="Meeting minutes are available to authorised team members. Sign in with your HFSE Microsoft account or your email and password on the home page."/>}
