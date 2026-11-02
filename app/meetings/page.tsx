import {access} from '../access';
import Meetings from './Meetings';
export const dynamic='force-dynamic';
export default async function Page(){const {user,canControl}=await access();return user?<Meetings controller={canControl} email={user.email}/>:<main className="entry"><h1>Sign-in required</h1><p>Meeting minutes are available to authorised team members. Sign in with your email and password on the home page.</p><a href="/">Return home</a></main>}
