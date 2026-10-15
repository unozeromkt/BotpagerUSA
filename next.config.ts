import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  rewrites() {
    return {
      beforeFiles: [{ source: "/es/Auditor%C3%ADaEffix/:path*", destination: "/es/AuditoriaEffix/:path*" }],
      afterFiles: [],
      fallback: [],
    };
  },
  redirects() {
    return [
      { source: "/ExperieciaEffix/api/diagnostic/:path*", destination: "/es/Auditor%C3%ADaEffix/api/diagnostic/:path*", permanent: true },
      { source: "/ExperieciaEffix/:path*", destination: "/es/experienciaEffix/:path*", permanent: true },
      { source: "/experienciaEffix/:path*", destination: "/es/experienciaEffix/:path*", permanent: true },
      { source: "/Auditor%C3%ADaEffix/:path*", destination: "/es/Auditor%C3%ADaEffix/:path*", permanent: true },
      { source: "/AuditoriaEffix/:path*", destination: "/es/Auditor%C3%ADaEffix/:path*", permanent: true },
      { source: "/feriaEffix2026/:path*", destination: "/es/feriaEffix2026/:path*", permanent: true },
      { source: "/es/ExperieciaEffix/api/diagnostic/:path*", destination: "/es/Auditor%C3%ADaEffix/api/diagnostic/:path*", permanent: true },
      { source: "/es/ExperieciaEffix/:path*", destination: "/es/experienciaEffix/:path*", permanent: true },
      { source: "/es/AuditoriaEffix/:path*", destination: "/es/Auditor%C3%ADaEffix/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
