/* eslint prefer-arrow-callback: [ "error", { "allowNamedFunctions": true } ] */

const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

admin.initializeApp();

const app = express();

app.get('/admin', function getAdmin(req, res) {
  console.log('Signed-in user:', req.user);
  return res.json({
    user: req.user,
  });
});

app.get('/:linkName?', function getLink(req, res) {
  const linkName = req.params.linkName || '';
  if (linkName.length > 100) {
    res.sendStatus(414).end();
    return;
  }
  const linkId = !linkName || linkName === '' ? '-' : linkName;
  const linkRef = admin.database()
    .ref('bounce')
    .child(linkId);
  linkRef.once('value')
    .then(function findLinkByName(snapshot) {
      const link = snapshot.val();
      if (link && link.to) {
        if (!req.user) {
          linkRef.child('hits').transaction(function addLinkHit(originalHitCount) {
            return (originalHitCount || 0) + 1;
          });
        }
        res.redirect(link.to);
      } else {
        res.sendStatus(404);
      }
      return null;
    })
    .catch(function findFunctionError() {
      res.sendStatus(500);
    });
});

exports.bounce = functions.https.onRequest((req, res) => {
  if (!req.path || !req.url || req.url[0] !== '/') {
    req.url = '/' + (req.url || '');
  }
  return app(req, res);
});