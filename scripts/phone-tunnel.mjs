import localtunnel from 'localtunnel';

async function startTunnel() {
  try {
    const tunnel = await localtunnel({
      port: 3000,
      subdomain: 'deendrip-live'
    });

    console.log('\n=========================================');
    console.log('📱 MOBILE PREVIEW LIVE URL:');
    console.log(tunnel.url);
    console.log('=========================================\n');

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      tunnel.close();
    });
  } catch (err) {
    console.error('Failed to start tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
