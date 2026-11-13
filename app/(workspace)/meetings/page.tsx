import {access} from '../../access';
import Meetings from './Meetings';
export const dynamic='force-dynamic';
// Signed-out visitors are stopped by app/(workspace)/layout.tsx; the meetings API also checks sign-in.
export default async function Page(){const {user,canControl}=await access();if(!user)return null;return <Meetings controller={canControl} email={user.email}/>;}
