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
    window.fbAsyncInit = function fbAsyncInit() {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v21.0',
      });
      resolve(window.FB);
    };

    if (document.getElementById('facebook-jssdk')) {
      return;
    }

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
