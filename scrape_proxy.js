const axios = require('axios');
const fs = require('fs');
const net = require('net');

// List sumber proxy
const sources = [
  'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
  'https://www.proxy-list.download/api/v1/get?type=http',
  'https://raw.githubusercontent.com/jetkai/proxy-list/main/archive/txt/proxies.txt',
  'https://raw.githubusercontent.com/almroot/proxylist/master/list.txt',
  'https://proxyspace.pro/http.txt',
  'https://raw.githubusercontent.com/themiralay/Proxy-List-World/master/data.txt'
];

// Fungsi untuk mengecek apakah proxy aktif
async function checkProxy(proxy) {
  const [ip, port] = proxy.split(':');
  return new Promise((resolve) => {
    const socket = net.createConnection(port, ip);
    socket.setTimeout(5000); // Timeout 5 detik
    socket.on('connect', () => {
      socket.destroy();
      resolve(true); // Proxy aktif
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false); // Proxy timeout
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false); // Proxy error
    });
  });
}

async function fetchProxies() {
  let proxies = [];

  // Mengambil proxy dari berbagai sumber
  for (const source of sources) {
    try {
      const response = await axios.get(source);
      proxies = proxies.concat(response.data.split('\n').filter(proxy => proxy));
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error.message);
    }
  }

  // Mengecek proxy satu per satu dan hanya menambahkan satu yang valid
  for (const proxy of proxies) {
    if (await checkProxy(proxy)) {
      // Menambahkan satu proxy valid ke dalam file
      fs.appendFileSync('proxy.txt', proxy + '\n');
      console.log('Added one valid proxy:', proxy);
      return;
    }
  }

  console.log('No valid proxy found this time.');
}

fetchProxies();
