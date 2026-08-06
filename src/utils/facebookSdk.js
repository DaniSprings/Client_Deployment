// Loads the Facebook JS SDK once and resolves with the initialized window.FB object.
let sdkPromise = null;

export function loadFacebookSdk(appId) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Facebook SDK requires a browser environment.'));
  }

  if (window.FB) {
    return Promise.resolve(window.FB);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    // Check if script is already in DOM BEFORE setting fbAsyncInit
    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      // Script exists, just set up the async init and wait for it
      window.fbAsyncInit = function fbAsyncInit() {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v21.0',
        });
        resolve(window.FB);
      };
      // If FB is already loaded, initialize immediately
      if (window.FB) {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v21.0',
        });
        resolve(window.FB);
      }
      return;
    }

    window.fbAsyncInit = function fbAsyncInit() {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v21.0',
      });
      resolve(window.FB);
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Failed to load the Facebook SDK.'));
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}
