const isProd = process.env.NODE_ENV === 'production';
console.log(process.env.NODE_ENV);
module.exports = {
  reactStrictMode: true,
  assetPrefix: isProd ? '/dev.s3/out' : undefined,
};
