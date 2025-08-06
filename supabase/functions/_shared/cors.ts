// Shared CORS configuration for all Edge Functions

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 
    'authorization, x-client-info, apikey, content-type, x-supabase-auth-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400', // 24 hours
}

export function createCorsResponse(
  data: any, 
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...additionalHeaders
      }
    }
  )
}

export function handleCorsPrelight(): Response {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders 
  })
}

export function createErrorResponse(
  error: string | Error, 
  status: number = 500,
  details?: any
): Response {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  return createCorsResponse({
    error: errorMessage,
    details: details || null,
    timestamp: new Date().toISOString()
  }, status)
}