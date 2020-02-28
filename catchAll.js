const { Worker, Client } = require('redis-request-broker');
const redis = require('redis');
const uuid = require('uuid').v4;
const validator = require('validator');

/** A worker that catches all request, authenticates and then forwards to an internal queue */

const queue = 'auth-requests';
const AUTH_FAIL = new Error('Authentication failed.');


const w = new Worker(queue, handle, { redis: { db: process.env.REQUEST_REDIS_DB, host: process.env.REQUEST_REDIS_HOST } });
const r = redis.createClient({
    host: process.env.TOKEN_REDIS_HOST,
    db: process.env.TOKEN_REDIS_DB
});

async function handle(data) {
    const token = data.token;

    if (!isValidUUID(token))
        throw AUTH_FAIL;

    const userId = await getUserId(token);

    // TODO defer
}

function isValidUUID(token) {
    if (!token)
        return false;

    if (typeof token !== 'string')
        return false;

    if (!validator.isUUID(token, 4))
        return false;

    return true;
}

async function getUserId(token) {
    return new Promise((resolve, reject) => {
        r.get(token, (error, id) => {
            if (error)
                return reject(error);

            if (!isValidUUID(id))
                return reject("Invalid user id");

            resolve(id);
        });
    });
}

async function start() {
    try {
        await w.listen();
        console.log('Listening...');
    }
    catch (error) {
        console.error('Failed to start', error);
    }
}

start();

process.on('beforeExit', async () => {
    try {
        await w.stop();
    }
    catch (error) {
        console.error('Failed to stop', error);
    }
});

