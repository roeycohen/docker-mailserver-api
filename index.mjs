import {config} from 'dotenv';
import express from 'express';
import {Api} from "./api.mjs";

config({path: 'dms-api.env'})

const app = express();
app.use(express.json());

// Middleware function to check the API Key
const authenticateApiKey = (req, res, next) =>
{
	if (process.env['API_KEY'])
	{
		const clientApiKey = req.header('X-API-Key');
		if (!clientApiKey)
			return res.status(403).send({success: false, message: 'Forbidden: Missing X-API-Key header.'});
		if (clientApiKey !== process.env['API_KEY'])
		{
			console.warn(`Authentication failed for request from ${req.ip}. Received key: ${clientApiKey}`);
			return res.status(403).send({success: false, message: 'Forbidden: Wrong key provided'});
		}
	}
	next();
};

const api = new Api(process.env.MAILSERVER_CONTAINER_NAME || 'mailserver');

app.get('/email/list', authenticateApiKey, (req, res) =>
{
	const m = api.email_list();
	res.status(200).send(m);
});

app.get('/email/add', authenticateApiKey, (req, res) =>
{
	api.email_add(req.query.user, req.query.password);
	res.status(200).send('');
});

app.get('/email/update', authenticateApiKey, (req, res) =>
{
	api.email_update(req.query.user, req.query.password);
	res.status(200).send('');
});

app.get('/email/del', authenticateApiKey, (req, res) =>
{
	api.email_del(req.query.user);
	res.status(200).send('');
});

app.use((err, req, res, next) =>
{
	res.status(err.statusCode || 500).json({
		status: 'error',
		message: err.message || 'Something went wrong!',
		data: err.data ?? '',
		// stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
	});
});

const port = process.env.PORT ?? 3000;
app.listen(port, () =>
{
	console.log(`dms-api listening on port ${port}.`);
});
