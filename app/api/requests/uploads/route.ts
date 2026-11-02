import {access} from '../../../access';
import {createUploadUrl} from '../../../../db';

const allowedExtensions=/\.(pdf|docx?|xlsx?|pptx?|png|jpe?g|txt|csv)$/i;
const MB=1024*1024;

// Files go straight from the browser to Supabase Storage because Vercel limits
// request bodies to about 4.5 MB. POST /api/requests then checks what actually arrived.
export async function POST(req:Request){
  const {canControl}=await access();
  if(!canControl)return Response.json({error:'Staff request access is awaiting login setup.'},{status:403});
  try{
    const body:any=await req.json();
    const files=Array.isArray(body.files)?body.files:[];
    const valid=files.every((f:any)=>typeof f?.name==='string'&&typeof f?.size==='number'&&f.size<=10*MB&&allowedExtensions.test(f.name));
    const total=files.reduce((n:number,f:any)=>n+(Number(f?.size)||0),0);
    if(!files.length||files.length>5||!valid||total>20*MB)return Response.json({error:'Attach up to 5 files, 10 MB per file and 20 MB total. Supported: PDF, Word, Excel, PowerPoint, PNG, JPG, TXT and CSV.'},{status:400});
    const requestId=crypto.randomUUID();
    const uploads=await Promise.all(files.map(async(f:any)=>{
      const id=crypto.randomUUID();
      return {id,name:f.name,url:await createUploadUrl(`requests/${requestId}/${id}`)};
    }));
    return Response.json({requestId,uploads});
  }catch{
    return Response.json({error:'Unable to prepare the upload. Please try again.'},{status:500});
  }
}
