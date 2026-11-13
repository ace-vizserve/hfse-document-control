import {access} from '../../access';
import RestrictedPanel from '../_shell/RestrictedPanel';
import Library from './Library';
export const dynamic='force-dynamic';
// The library API only serves administrators until staff access is set up.
export default async function Page(){const {canControl}=await access();if(!canControl)return <RestrictedPanel message="The Staff Document Library is not yet open to staff. Document Control administrators can preview it."/>;return <Library/>;}
