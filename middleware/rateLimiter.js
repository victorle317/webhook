const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const RedisClient = require('ioredis')
const { URL } = require('url');

const url = new URL(process.env.REDIS_URL);

const client = new RedisClient({
	host: url.hostname,
	port: url.port,
	user: process.env.REDIS_USER,
	password: process.env.REDIS_PWD,
	tls:true
})
async function listAllKeys() {
    const keys = await client.keys('*');
    console.log(keys);
	// client.keys('*', (err, keys) => {
	// 	if (err) return console.log(err);
	// 	const keysToDelete = keys.filter(key => !key.startsWith('bull:generxxxxx'));
	// 	if (keysToDelete.length > 0) { client.del(keysToDelete, (err, response) => {
	// 		if (err) return console.log(err);
	// 		console.log(`Deleted ${response} keys`);});
	// 	} else {console.log('No keys to delete');
	// 	}})
}

// listAllKeys();

class RateLimiter {
	instance = null
	constructor() {
		if (!this.instance) {
			this.instance = rateLimit({
				windowMs: 1 * 60 * 1000, // 2 minutes
				max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
				standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
				legacyHeaders: false, // Disable the `X-RateLimit-*` headers
				message: 'Excessive request rate detected. Your IP has been flagged for potential security violations. Further attempts may result in permanent ban. For more details, please contact <a href="https://victorle.works">Admin</a>',
				store: new RedisStore({
					sendCommand: (...args) => client.call(...args),
				}),
				validate: {trustProxy: false}
				// keyGenerator: (request, res) => {
				// 	if (!request.ip) {
				// 		console.error(
                //           'WARN | `express-rate-limit` | `request.ip` is undefined. You can avoid this by providing a custom `keyGenerator` function, but it may be indicative of a larger issue.',
				// 		);
                //     }
                //     return request.ip.replace(/:\d+[^:]*$/, '');
				// }
			})
		}
	}

	get rateLimiter() {
		return this.instance;
	}
}
const rateLimiter = new RateLimiter();




module.exports = rateLimiter.rateLimiter