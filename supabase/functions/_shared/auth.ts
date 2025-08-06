// Shared authentication utilities for Edge Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export async function createAuthenticatedSupabaseClient(request: Request) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') ?? ''
        }
      }
    }
  )

  return supabaseClient
}

export async function getAuthenticatedUser(request: Request) {
  const supabaseClient = await createAuthenticatedSupabaseClient(request)
  
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized: Invalid or missing authentication token')
  }
  
  return { user, supabaseClient }
}

export async function createServiceRoleClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export async function verifyUserOwnership(
  request: Request, 
  resourceUserId: string
): Promise<{ user: any; isOwner: boolean }> {
  const { user } = await getAuthenticatedUser(request)
  const isOwner = user.id === resourceUserId
  
  return { user, isOwner }
}