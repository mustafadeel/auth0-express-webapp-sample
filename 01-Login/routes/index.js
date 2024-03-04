var router = require('express').Router();
const request = require('request-promise-native');
const { requiresAuth, AccessToken } = require('express-openid-connect');
const jose = require('jose')

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Auth0 Partner Integratino Demo',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

router.get('/profile', requiresAuth(), function (req, res, next) {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page'
  });
});

router.get('/read-clients', requiresAuth(), async (req, res) => {
  let { token_type, access_token, isExpired, refresh } = req.oidc.accessToken;
  if (isExpired()) {
    ({ access_token } = await refresh());
  }
  const claims = jose.JWT.decode(access_token);

  let apiGetClients = claims.aud[0] + 'clients?fields=client_id,app_type,name,description'
 
  const getClients = await request.get(
    apiGetClients, {
    headers: {
      Authorization: `${token_type} ${access_token}`,
    },
  });
  
  res.render('clients',{
    api: claims.aud[0],
    title: 'Available Clients',
    clients: JSON.stringify(JSON.parse(getClients),null,2)
  });

});

module.exports = router;
