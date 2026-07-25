{
  id: 'v1_ChdDVDVqYXM2RFBJajd4czBQc2VqRW1RbxIXQ1Q1amFzNkRQSWo3eHMwUHNlakVtUW8',
  status: 'completed',
  usage: {
    total_tokens: 53,
    total_input_tokens: 9,
    input_tokens_by_modality: [ [Object] ],
    total_cached_tokens: 0,
    total_output_tokens: 44,
    total_tool_use_tokens: 0,
    total_thought_tokens: 0
  },
  created: '2026-07-24T10:27:21Z',
  updated: '2026-07-24T10:27:21Z',
  service_tier: 'standard',
  steps: [
    {
      signature: 'EjQKMgERTTIPc9H0yI+gpBV0wfrpW5F/DzTIizRrb3/pb9CrlJjed9mvyxHXTgzhpeXYpHZM',
      type: 'thought'
    },
    { content: [Array], type: 'model_output' }
  ],
  object: 'interaction',
  model: 'gemini-3.1-flash-lite',
  sdkHttpResponse: {
    headers: {
      'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
      'content-encoding': 'gzip',
      'content-type': 'application/json',
      date: 'Fri, 24 Jul 2026 10:27:23 GMT',
      server: 'scaffolding on HTTPServer2',
      'server-timing': 'gfet4t7; dur=2551',
      'transfer-encoding': 'chunked',
      vary: 'Origin, X-Origin, Referer',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN',
      'x-xss-protection': '0'
    },
    responseInternal: Response {
      status: 200,
      statusText: 'OK',
      headers: Headers {
        'content-type': 'application/json',
        vary: 'Origin, X-Origin, Referer',
        'content-encoding': 'gzip',
        date: 'Fri, 24 Jul 2026 10:27:23 GMT',
        server: 'scaffolding on HTTPServer2',
        'x-xss-protection': '0',
        'x-frame-options': 'SAMEORIGIN',
        'x-content-type-options': 'nosniff',
        'server-timing': 'gfet4t7; dur=2551',
        'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
        'transfer-encoding': 'chunked'
      },
      body: ReadableStream { locked: true, state: 'closed', supportsBYOB: true },
      bodyUsed: true,
      ok: true,
      redirected: false,
      type: 'basic',
      url: 'https://generativelanguage.googleapis.com/v1beta/interactions'
    },
    json: [AsyncFunction: json]
  },
  output_text: 'The capital of the Netherlands is **Amsterdam**. \n' +
    '\n' +
    'While Amsterdam is the capital city, it is worth noting that the seat of government, the parliament, and the residence of the monarch are located in **The Hague**.'
}