// Form contatti — placeholder.
// In Fase 6 lo collegheremo a un servizio di email (Resend free tier o simile).
// Per ora restituisce solo success per testare il flusso frontend.

export async function onRequestPost(context) {
  try {
    const data = await context.request.json()
    const { name, email, message, service } = data

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campi mancanti' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // TODO Fase 6: inviare email via Resend o Cloudflare Email Routing
    console.log('Nuovo contatto:', { name, email, service, message })

    return new Response(
      JSON.stringify({ success: true, message: 'Messaggio ricevuto' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Errore server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
