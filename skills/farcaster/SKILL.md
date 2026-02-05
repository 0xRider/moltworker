---
name: farcaster
description: Post casts to Farcaster using Neynar managed signer
metadata:
  {
    "openclaw":
      {
        "emoji": "🟣",
        "requires": { "bins": ["node"], "env": ["FARCASTER_API_KEY", "FARCASTER_SIGNER_UUID"] },
      },
  }
---

# Farcaster

Post casts to Farcaster using Neynar's managed signer API. Simple and easy - no wallet management required.

## Prerequisites

Set these environment variables (already configured as Cloudflare secrets):
- `FARCASTER_API_KEY` - Your Neynar API key
- `FARCASTER_SIGNER_UUID` - Your agent's signer UUID from Neynar

## Post a Cast

```bash
node {baseDir}/post.js "Your cast text here"
```

Or with options:

```bash
# Reply to a cast
node {baseDir}/post.js "My reply" --parent 0xabcdef123...

# Post with embeds (URLs)
node {baseDir}/post.js "Check this out" --embed "https://example.com"

# Post in a channel
node {baseDir}/post.js "Hello channel!" --channel farcaster
```

## Programmatic Usage

```javascript
const { postCast, replyCast, getCast } = require("{baseDir}");

// Post a new cast
const result = await postCast("Hello Farcaster!");
console.log("Cast hash:", result.cast.hash);
console.log("URL:", `https://warpcast.com/~/conversations/${result.cast.hash}`);

// Reply to a cast
const reply = await replyCast("0xparenthash...", "Nice post!");

// Get cast details
const cast = await getCast("0xhash...");
```

## API Reference

### postCast(text, options?)

Post a new cast.

**Options:**
- `embeds` - Array of URLs to embed
- `channel` - Channel ID to post in
- `parentHash` - Hash of cast to reply to
- `parentFid` - FID of parent author (for replies)

### replyCast(parentHash, text, options?)

Reply to an existing cast. Automatically fetches parent FID.

### getCast(hash)

Get cast details by hash.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `FARCASTER_API_KEY` | Neynar API key |
| `FARCASTER_SIGNER_UUID` | Managed signer UUID |
