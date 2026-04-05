import Image from "next/image";

// SVG Icons
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 sm:p-12 overflow-hidden bg-zinc-50 dark:bg-[#050505] transition-colors duration-500">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 dark:bg-cyan-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[80px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      <main className="relative z-10 w-full max-w-3xl glass-panel rounded-3xl p-8 sm:p-14 shadow-2xl animate-fade-in-up">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border border-white/50 dark:border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-float">
             <Image
                src="/avatar.png"
                alt="Profile Avatar"
                fill
                sizes="(max-width: 768px) 160px, 192px"
                className="object-cover"
                priority
             />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-cyan-100 dark:to-purple-200">
              윤창식
            </h1>
            <h2 className="text-sm sm:text-base font-semibold text-zinc-500 dark:text-cyan-400 tracking-widest uppercase">
              Frontend Engineer & AI Agent Pipeline Designer
            </h2>
          </div>
        </div>

        {/* Bio / Description */}
        <div className="mt-10 space-y-6 text-lg xl:text-xl leading-relaxed text-zinc-600 dark:text-zinc-300 text-center max-w-2xl mx-auto">
          <p className="font-light">
            AI 에이전트 파이프라인 설계와 프론트엔드 엔지니어링의 접점을 탐구합니다.<br/> 
            AI-Native 개발 워크플로우와 자동화에 깊은 관심을 가지고 활동하고 있습니다.
          </p>
          <div className="h-px w-16 bg-zinc-200 dark:bg-zinc-800/50 mx-auto"></div>
          <p className="font-light text-base sm:text-lg">
            기술 서적 <strong className="font-semibold text-zinc-900 dark:text-white">&quot;자바스크립트 + 리액트 디자인 패턴&quot;</strong>의 역자로 참여하며 
            지식 공유와 기술 전파에 기여하고 있습니다.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mt-12 w-full max-w-2xl mx-auto">
          <a
            href="https://github.com/caesiumy"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-1 dark:bg-white/5 dark:hover:bg-white/10 dark:border dark:border-white/10"
          >
            <GithubIcon />
            <span className="font-medium">GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/chang-sik-yoon"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 dark:bg-[#0a0a0a] dark:hover:bg-zinc-900 dark:text-white dark:border-white/5 dark:hover:border-purple-500/50 dark:hover:shadow-purple-500/20"
          >
            <LinkedinIcon />
            <span className="font-medium">LinkedIn</span>
          </a>
          <a
            href="https://caesiumy.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white transition-all duration-300 shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-1"
          >
            <GlobeIcon />
            <span className="font-medium">Blog</span>
          </a>
        </div>

        {/* Footer info */}
        <footer className="mt-16 text-center text-xs font-semibold tracking-[0.2em] text-zinc-400 dark:text-zinc-600 uppercase">
          Built with Next.js & Tailwind CSS
        </footer>
      </main>
    </div>
  );
}
