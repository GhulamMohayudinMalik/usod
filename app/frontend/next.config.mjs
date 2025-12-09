/** @type {import('next').NextConfig} */
const nextConfig = {
  // put it at the TOP level
  allowedDevOrigins: [
    '192.168.100.113',   // your mobile IP
    '192.168.0.0/16',    // optional: allow entire LAN
    '10.0.0.0/8',        // optional: allow 10.x.x.x networks
    '172.21.160.1',
  ],
};

export default nextConfig;
