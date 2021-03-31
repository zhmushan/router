function handleRequest(_req: Request) {
  return new Response(undefined, {
    headers: {
      "Location": "https://deno.land/x/router",
    },
    status: 302,
  });
}

addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});
