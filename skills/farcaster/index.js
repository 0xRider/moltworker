/**
 * Farcaster posting via Neynar managed signer API
 */

const NEYNAR_API_BASE = "https://api.neynar.com/v2/farcaster";

function getConfig() {
  const apiKey = process.env.FARCASTER_API_KEY;
  const signerUuid = process.env.FARCASTER_SIGNER_UUID;

  if (!apiKey) throw new Error("FARCASTER_API_KEY environment variable not set");
  if (!signerUuid) throw new Error("FARCASTER_SIGNER_UUID environment variable not set");

  return { apiKey, signerUuid };
}

/**
 * Post a cast to Farcaster
 * @param {string} text - Cast text (max 320 chars)
 * @param {Object} options - Optional settings
 * @param {string[]} options.embeds - URLs to embed
 * @param {string} options.channel - Channel ID to post in
 * @param {string} options.parentHash - Parent cast hash (for replies)
 * @param {number} options.parentFid - Parent author FID (for replies)
 * @returns {Promise<Object>} Cast result
 */
async function postCast(text, options = {}) {
  const { apiKey, signerUuid } = getConfig();

  const body = {
    signer_uuid: signerUuid,
    text,
  };

  if (options.embeds?.length) {
    body.embeds = options.embeds.map(url => ({ url }));
  }

  if (options.channel) {
    body.channel_id = options.channel;
  }

  if (options.parentHash) {
    body.parent = options.parentHash;
    if (options.parentFid) {
      body.parent_author_fid = options.parentFid;
    }
  }

  const response = await fetch(`${NEYNAR_API_BASE}/cast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Neynar API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Reply to a cast
 * @param {string} parentHash - Hash of the cast to reply to
 * @param {string} text - Reply text
 * @param {Object} options - Optional settings
 * @returns {Promise<Object>} Cast result
 */
async function replyCast(parentHash, text, options = {}) {
  // Fetch parent cast to get the FID
  const parent = await getCast(parentHash);

  return postCast(text, {
    ...options,
    parentHash,
    parentFid: parent.cast.author.fid,
  });
}

/**
 * Get a cast by hash
 * @param {string} hash - Cast hash
 * @returns {Promise<Object>} Cast details
 */
async function getCast(hash) {
  const { apiKey } = getConfig();

  const response = await fetch(
    `${NEYNAR_API_BASE}/cast?identifier=${hash}&type=hash`,
    {
      headers: {
        "x-api-key": apiKey,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Neynar API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Delete a cast
 * @param {string} hash - Cast hash to delete
 * @returns {Promise<Object>} Result
 */
async function deleteCast(hash) {
  const { apiKey, signerUuid } = getConfig();

  const response = await fetch(`${NEYNAR_API_BASE}/cast`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      signer_uuid: signerUuid,
      target_hash: hash,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Neynar API error: ${response.status} - ${error}`);
  }

  return response.json();
}

module.exports = {
  postCast,
  replyCast,
  getCast,
  deleteCast,
};
