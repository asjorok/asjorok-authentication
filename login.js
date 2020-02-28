const { Worker, Client } = require('redis-request-broker');
queue = 'auth-requests';

/** Produces tokens for the user to authenticate with */

const w = new Worker(queue, handle, {});

async function handle(data) {

}

function start() {

}
