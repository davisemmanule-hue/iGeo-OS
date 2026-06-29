export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "www.igeosolutionsllc.com") {
      url.hostname = "igeosolutionsllc.com";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/worker-intake") {
      url.pathname = "/worker-intake.html";
    }

    return env.ASSETS.fetch(new Request(url, request));
  },
};
