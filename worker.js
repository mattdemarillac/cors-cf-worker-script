// Reference: https://developers.cloudflare.com/workers/examples/cors-header-proxy
const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Max-Age": "86400",
}
function handleOptions (request) {
        // Make sure the necessary headers are present
        // for this to be a valid pre-flight request
        let headers = request.headers
        if (
                headers.get("Origin") !== null &&
                headers.get("Access-Control-Request-Method") !== null &&
                headers.get("Access-Control-Request-Headers") !== null
        ) {
                // Handle CORS pre-flight request.
                // If you want to check or reject the requested method + headers
                // you can do that here.
                let respHeaders = {
                        ...corsHeaders,
                        // Allow all future content Request headers to go back to browser
                        // such as Authorization (Bearer) or X-Client-Name-Version
                        "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers"),
                }
                return new Response(null, {
                        headers: respHeaders,
                })
        }
        else {
                // Handle standard OPTIONS request.
                // If you want to allow other HTTP Methods, you can do that here.
                return new Response(null, {
                        headers: {
                                Allow: "GET, HEAD, POST, OPTIONS",
                        },
                })
        }
}
async function handleRequest (request) {
        let response
        if (request.method === "OPTIONS") {
                response = handleOptions(request)
        }
        else {
                response = await fetch(request)
                response = new Response(response.body, response)
                response.headers.set("Access-Control-Allow-Origin", "*")
                response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        }
        return response
}
addEventListener("fetch", (event) => {
        event.respondWith(
                handleRequest(event.request).catch(
                        (err) => new Response(err.stack, { status: 500 })
                )
        );
});
