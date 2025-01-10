import express from "express";
import {
  generateJwt,
  generateKey,
  getOpenIdConnectConfigResponse,
} from "../authentication-helpers";

const setHeaders = (res: express.Response): void => {
  res.contentType("application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const getPath = (url: string): string => {
  const parsed = new URL(url);
  return parsed.pathname;
};

const getUrl = (request: express.Request, fallback: string): string =>
  (request.headers["x-forwarded-url"] as string | undefined) ??
  (request.headers["host"] && `http://${request.headers["host"]}`) ??
  fallback;

(async (): Promise<void> => {
  const kid = "test-key";
  const [keyPair, publicKey] = await generateKey(kid);

  const app = express();
  const port = process.env.PORT ?? 3333;
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

  const localUrl = `http://localhost:${port}`;
  const localConfig = getOpenIdConnectConfigResponse(localUrl);

  let user = {
    oidcSub: "123",
    email: "jane@doe.com",
    name: "Jane Doe",
  };

  let nonce = "";

  // no body-parsing
  app.use(express.raw({ type: "*/*" }));

  app.use((req, res, next) => {
    setHeaders(res);
    next();
  });

  app.get("/user", (_request, response) => {
    response.send(user);
  });

  app.post("/user", (request, response) => {
    const newUser = JSON.parse((request.body as Buffer).toString("utf-8"));

    if (
      !("oidcSub" in newUser) ||
      !("email" in newUser) ||
      !("name" in newUser)
    ) {
      throw new Error("Invalid user data");
    }

    user = newUser;

    response.send({ success: true });
  });

  app.get("/.well-known/openid-configuration/", (request, response) => {
    response.send(
      JSON.stringify(
        getOpenIdConnectConfigResponse(
          // get the proxy forwarded for URL from the request or fallback to the HOST header
          getUrl(request, localUrl),
        ),
      ),
    );
  });

  app.get(getPath(localConfig.jwks_uri), (_request, response) => {
    response.send(
      JSON.stringify({
        keys: [publicKey],
      }),
    );
  });

  app.get(getPath(localConfig.authorization_endpoint), (request, response) => {
    // extract redirect_uri from the request
    const redirectUri = request.query["redirect_uri"];
    const nonceInUrl = request.query["nonce"];
    const state = request.query["state"];

    nonce = nonceInUrl as string;

    response.redirect(
      `${frontendUrl}/login/oidc-redirect?code=abc&state=${state}&nonce=${nonceInUrl}&redirect_uri=${redirectUri}`,
    );
  });

  app.post(getPath(localConfig.token_endpoint), async (request, response) => {
    // get request body
    const postData = (request.body as Buffer).toString("utf-8");

    // get client_id from post data
    const [_, clientId] = /client_id=([^&]+)/.exec(postData) as unknown as [
      string,
      string,
    ];

    const jwt = await generateJwt(
      keyPair,
      kid,
      clientId,
      nonce,
      getUrl(request, localUrl),
      user.oidcSub,
      user.email,
      user.name,
    );

    response.send(
      JSON.stringify({
        token_type: "Bearer",
        refresh_token: "8xLOxBtZp8",
        expires_in: 3600,
        id_token: jwt,
        access_token: "fake_access_token",
      }),
    );
  });

  app.get(getPath(localConfig.userinfo_endpoint), (_request, response) => {
    response.send(
      JSON.stringify({
        sub: user.oidcSub,
        name: user.name,
        email: user.email,
      }),
    );
  });

  app.listen(port, () => {
    console.log(`Mock OpenId Connect server listening on ${localUrl}`);
  });
})();
