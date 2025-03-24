# Replicate Webhook Server

This is a simple Express server that handles webhooks from Replicate. It includes signature verification for security and handles different webhook events.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set your `REPLICATE_WEBHOOK_SECRET` in the `.env` file
   - The secret should match the one you set in your Replicate webhook settings

3. Start the server:
```bash
node index.js
```

## Webhook Endpoint

The webhook endpoint is available at: `POST /webhook/replicate`

### Security

The webhook endpoint verifies the signature of incoming requests using HMAC SHA-256. The signature is expected in the `x-replicate-signature` header.

### Supported Events

- `prediction.completed`: Triggered when a prediction is completed
- `prediction.failed`: Triggered when a prediction fails

## Health Check

A health check endpoint is available at: `GET /health`

## Environment Variables

- `PORT`: Server port (default: 3000)
- `REPLICATE_WEBHOOK_SECRET`: Your Replicate webhook secret 