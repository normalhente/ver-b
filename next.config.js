/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // 모든 요청에 대해서
        source: '/:path*',
        headers: [
          // X-Frame-Options 헤더는 아예 빼고,
          // CSP 로만 frame-ancestors 를 제어합니다.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'", 
              // Cargo 에서 쓰는 도메인(ex: cargo.site)과
              // 필요하다면 Framer 도메인도 추가하세요.
              "frame-ancestors 'self' https://cargo.site https://framer.com"
            ].join('; ')
          }
        ],
      },
    ]
  },
};

module.exports = nextConfig;
