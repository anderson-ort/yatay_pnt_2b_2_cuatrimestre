import { HttpError } from './http.ts'

const COHERE_URL = 'https://api.cohere.ai/v2/chat'

// Envía un prompt a Cohere y devuelve el JSON ya parseado.
// El schema obliga al modelo a respetar la estructura de la respuesta.
export async function pedirJson(system: string, usuario: string, schema: object): Promise<unknown> {
  const apiKey = Deno.env.get('COHERE_API_KEY')
  
  if (!apiKey) {
    console.error('Falta el secret COHERE_API_KEY')
    throw new HttpError('El servicio de IA no está configurado', 503)
  }

  let res: Response
  
  try {
    res = await fetch(COHERE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify({
        model: Deno.env.get('COHERE_MODEL') ?? 'command-a-03-2025',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: usuario },
        ],
        response_format: { type: 'json_object', schema },
        temperature: 0, // queremos la interpretación más predecible, no creatividad
      }),
      signal: AbortSignal.timeout(25_000),
    })
  } catch (err) {
    console.error('[cohere] error de red o timeout', err)
    throw new HttpError('No se pudo contactar al servicio de IA', 502)
  }

  if (!res.ok) {
    // El detalle va al log del servidor; al cliente, un mensaje genérico
    console.error(`[cohere] respondió ${res.status}:`, await res.text())
    throw new HttpError('El servicio de IA respondió con error', 502)
  }

  const data = await res.json()
  const texto = data?.message?.content?.[0]?.text
  try {
    return JSON.parse(texto)
  } catch {
    throw new HttpError('La IA devolvió un formato inválido', 502)
  }
}
