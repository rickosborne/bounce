'use strict';

const handler = require('./bounce-link-handler');
handler.handleBounceRequest({
  pathParameters: {
    linkId: 'github'
  }
}, {}).then((result) => {
  console.log(JSON.stringify(result, null, 2));
}).catch((reason) => {
  console.error(JSON.stringify(reason));
});
