# TODO

## Google Login is broken in production (client-deployment-xi.vercel.app)

**Reproduced:** Opened the live site → Login modal → "Continue with Google" →
button shows "Connecting…" then the modal displays **"Login did not complete.
Please try again or sign up."**

### Root cause

The deployed `LoginModal` does **not** use real Google OAuth at all:

1. [`src/Components/LoginModal.jsx`](src/Components/LoginModal.jsx) has
   `useGoogleLogin` imported-then-commented-out (line 3) and instead calls
   `handleSocialLogin('google')`, which just does
   `window.open('<API_BASE>/auth/google', ...)` and polls until the popup
   closes.
2. That popup hits `ClientAPI`'s `GET /auth/google` route
   (`src/routes/socialAuth.routes.js`), which calls
   `authService.createDevSocialLogin('google')`.
3. `createDevSocialLogin` immediately throws a `501` unless the backend env
   var `ALLOW_DEV_SOCIAL_LOGIN=true` is set (`src/config/env.js`,
   `src/services/auth.service.js`). It is a **dev-only fake login stub** — it
   is not real Google authentication, it just logs everyone into a single
   fake `google.demo@local.dev` account.
4. Since `ALLOW_DEV_SOCIAL_LOGIN` is not set to `true` on the production
   Railway deployment, the popup renders an error page and auto-closes after
   3s (`renderError()` in `socialAuth.routes.js`), which the frontend's poll
   loop reports as "Login did not complete."
5. There is no `GoogleOAuthProvider` anywhere in `Client_Deployment`
   (checked `src/main.jsx`), even though `@react-oauth/google` is already a
   dependency in `package.json`. Real Google Sign-In was never wired up.

### Action items

- [x] Decide on the real Google OAuth strategy: **implicit flow + Google
      `userinfo` endpoint**, since it works against the already-deployed
      `POST /api/auth/social-login` route (`authRouter` in
      `ClientAPI/src/routes/auth.routes.js`) without any backend changes.
      Implemented directly in `LoginModal.jsx` via `useGoogleLogin`.
- [x] Wrap the app root in `<GoogleOAuthProvider clientId={...}>` in
      `src/main.jsx`, using a `VITE_GOOGLE_CLIENT_ID` env var (added to
      `.env`, set to the same value as ClientAPI's `GOOGLE_CLIENT_ID`).
- [x] Replace `LoginModal`'s Google button `onClick={() =>
      handleSocialLogin('google')}` with the real `useGoogleLogin` flow
      instead of the popup-to-`/auth/google` dev stub.
- [x] Guard the `/auth/google` and `/auth/facebook` dev-stub routes in
      `ClientAPI` (`socialAuth.routes.js`) so they short-circuit with an
      error whenever `isProduction` is true, regardless of
      `ALLOW_DEV_SOCIAL_LOGIN`.
- [x] Same problem applies to "Continue with Facebook" — real Facebook Login
      now wired up in `LoginModal.jsx` via the Facebook JS SDK
      (`src/utils/facebookSdk.js`): `FB.login()` → `FB.api('/me', ...,
      {fields:'id,name,email'})` → existing `authApi.socialLogin('facebook',
      ...)` → `POST /api/auth/social-login` (no backend changes needed, same
      as the Google flow). Requires `VITE_FACEBOOK_APP_ID` (added to `.env`).
- [ ] After the fix, re-test on the live deployment (or a preview deploy)
      by actually completing the Google consent screen, not just simulating
      the click. Also set `VITE_GOOGLE_CLIENT_ID` on the Vercel project and
      confirm `GOOGLE_CLIENT_ID` is set on the Railway `ClientAPI` deployment.
