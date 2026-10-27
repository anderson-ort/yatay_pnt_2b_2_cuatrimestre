// El navegador manda un OPTIONS (preflight) antes del POST.
// En producción reemplazá '*' por el dominio de tu app (secret ALLOWED_ORIGIN).
export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Error con código HTTP, para responder al cliente con el status correcto
export class HttpError extends Error {
  constructor(message: string, public status = 500) {
    super(message)
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

