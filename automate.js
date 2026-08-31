const { execSync } = require('child_process');

const INTERVAL_MS = 60000; // Polls every 60 seconds

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (e) {
    return false;
  }
}

async function startAutomator() {
  while (true) {
    console.log('[Automator] Checking for updates...');

    // 1. Fetch & Check for updates from GitHub
    run('git fetch origin main');
    const hasUpdates = execSync('git rev-list HEAD..origin/main').toString().trim().length > 0;

    if (hasUpdates) {
      console.log('[Automator] New changes detected. Running pipeline...');

      // Sync local repo
      run('git pull origin main');

      // Publish NPM package
      run('npm publish --access public || true');

      // Deploy to Vercel
      if (process.env.VERCEL_TOKEN) {
        run(`npx vercel --prod --token ${process.env.VERCEL_TOKEN} --confirm`);
      }

      // Purge CDN Cache
      if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
        run(`curl -X POST "https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache" \
          -H "Authorization: Bearer ${process.env.CLOUDFLARE_API_TOKEN}" \
          -H "Content-Type: application/json" \
          --data '{"purge_everything":true}'`);
      }

      // Push any generated tags back to GitHub
      run('git push origin main --tags');
    }

    await new Promise((res) => setTimeout(res, INTERVAL_MS));
  }
}

startAutomator();