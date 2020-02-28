const http = require('http');
const https = require('https');
const { t, d, r } = require('minimist')(process.argv.slice(2));

const checkRoot = config => {
  const { delaySeconds, rootUrl } = config ? config : { delaySeconds: 6 };
  const delay = delaySeconds * 1000;
  const protocolString = rootUrl.split(':')[0];
  const protocol = {
    http: http,
    https: https,
  };
  return new Promise(res => {
    setTimeout(() => {
      protocol[protocolString]
        .get(rootUrl, resp => {
          let data = '';
          resp.on('data', chunk => {
            data += chunk;
          });
          resp.on('end', () => {
            res({ success: data.includes('<title>') });
          });
        })
        .on('error', err => {
          console.log(`Error: ${err.message}`);
          res({ success: false });
        });
    }, delay);
  });
};
const repeatChecking = async ({ times, delaySeconds, rootUrl }) => {
  let isReady = false;
  console.log(
    `will try ${times}, and with ${delaySeconds} seconds delay in between for ${rootUrl}`
  );
  let i = 1;
  while (i <= times) {
    if (isReady === true) {
      break;
    }
    const res = await checkRoot({ delaySeconds, rootUrl }).then();
    isReady = res.success;
    console.log(`testing ${i}, status: root ready => ${res.success}`);
    i++;
  }
  if (isReady) {
    console.log('Done, root is ready');
    return;
  }
  process.stdout.write('ERROR: root could not be reached\n');
  process.exit(1);
};

repeatChecking({ times: t, delaySeconds: d, rootUrl: r });
