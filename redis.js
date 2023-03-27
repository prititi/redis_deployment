const { createClient } = require('redis');
const client = createClient();
client.connect()


module.exports={client}