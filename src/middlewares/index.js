import cors from 'edge-cors'
import {SUCCESS} from "$api/status";


export default async function corsMiddleware(req) {
    await cors(
      req,
       new Response(JSON.stringify({ message: 'can make api request' }), {
        status: SUCCESS,
        headers: {...req.headers,'Content-Type': 'application/json' },
       })
     )
  }
  
  export const middleWares = [
      corsMiddleware,
  ]