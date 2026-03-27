require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 8002;
app.listen(port, () => console.log(`node-qr running on port ${port}`));
