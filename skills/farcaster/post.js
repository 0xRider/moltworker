#!/usr/bin/env node
/**
 * CLI for posting casts to Farcaster
 *
 * Usage:
 *   node post.js "Your cast text"
 *   node post.js "Reply text" --parent 0xhash
 *   node post.js "With embed" --embed https://example.com
 *   node post.js "In channel" --channel farcaster
 */

const { postCast, replyCast } = require("./index");

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Usage: node post.js <text> [options]

Options:
  --parent <hash>    Reply to a cast (hash)
  --embed <url>      Add an embed (can use multiple times)
  --channel <id>     Post in a channel
  --help, -h         Show this help

Examples:
  node post.js "Hello Farcaster!"
  node post.js "Check this out" --embed https://example.com
  node post.js "Great post!" --parent 0xabc123
  node post.js "Channel post" --channel farcaster
`);
    process.exit(0);
  }

  // Parse arguments
  const text = args[0];
  const options = {
    embeds: [],
  };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case "--parent":
        options.parentHash = args[++i];
        break;
      case "--embed":
        options.embeds.push(args[++i]);
        break;
      case "--channel":
        options.channel = args[++i];
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  try {
    let result;

    if (options.parentHash) {
      console.log(`Replying to ${options.parentHash}...`);
      result = await replyCast(options.parentHash, text, options);
    } else {
      console.log("Posting cast...");
      result = await postCast(text, options);
    }

    console.log("Success!");
    console.log("Hash:", result.cast.hash);
    console.log("URL:", `https://warpcast.com/~/conversations/${result.cast.hash}`);

    if (result.cast.author) {
      console.log("Author:", `@${result.cast.author.username} (FID: ${result.cast.author.fid})`);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
