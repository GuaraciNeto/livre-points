var Nxt = new DoubleChecker({
  numUseSources: 3,
  dataType: 'json',
  ignoreJSONKeys: ['requestProcessingTime'],
  sources: [
    {
      transport: 'http',
      host: 'de014.static.nxt-nodes.net',
      port: 7876,
      path: '/nxt',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    {
      transport: 'http',
      host: 'nxt1.scriba.io',
      port: 7876,
      path: '/nxt',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    {
      transport: 'http',
      host: 'de016.static.nxt-nodes.net',
      port: 7876,
      path: '/nxt',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  ],
});
