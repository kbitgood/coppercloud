const server = Bun.serve({
  port: 0,
  routes: {
    '/api/echo-auth': async (request) => {
      const authorization = request.headers.get('authorization') ?? ''
      const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''

      return Response.json({
        authorization,
        token,
      })
    },
  },
  fetch() {
    return new Response('Not found', { status: 404 })
  },
})

console.log(JSON.stringify({ port: server.port }))
