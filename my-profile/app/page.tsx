import Image from "next/image";

// SVG Icons
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" className="w-10 h-10">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen font-sans selection:bg-brutal-pink selection:text-black flex flex-col">
      {/* Top Marquee Banner */}
      <div className="w-full border-b-4 border-black bg-brutal-green overflow-hidden flex items-center py-3 relative shrink-0">
        <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl font-black uppercase tracking-widest text-black">
          <span>AI Agent Pipeline Designer</span>
          <span>★</span>
          <span>Frontend Engineer</span>
          <span>★</span>
          <span>Design Systems</span>
          <span>★</span>
          <span>Web Automation</span>
          {/* Duplicate for seamless infinite loop */}
          <span>★</span>
          <span>AI Agent Pipeline Designer</span>
          <span>★</span>
          <span>Frontend Engineer</span>
          <span>★</span>
          <span>Design Systems</span>
          <span>★</span>
          <span>Web Automation</span>
        </div>
      </div>

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-12 md:px-12 md:py-20">
        {/* Grid layout for Desktop & Landing Page Scale */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Profile Hero (col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left gap-10">
            {/* Avatar container */}
            <div className="relative w-64 h-64 md:w-[350px] md:h-[350px] border-[5px] border-black shadow-brutal-lg bg-brutal-white active-brutal transition-transform">
               <Image
                  src="/avatar.png"
                  alt="Chang-sik Yoon"
                  fill
                  sizes="(max-width: 768px) 256px, 350px"
                  className="object-cover"
                  priority
               />
               <div className="absolute -bottom-6 -right-6 md:-right-8 bg-brutal-pink border-[4px] border-black shadow-brutal-sm px-4 py-2 rotate-[10deg] z-10 hidden sm:block">
                 <span className="text-xl font-black uppercase text-black">Hello!</span>
               </div>
            </div>
            
            <div className="space-y-6 w-full">
              <h1 className="text-[5rem] md:text-[7rem] leading-none font-black uppercase tracking-tighter text-shadow-brutal text-white">
                윤창식
              </h1>
              <div className="inline-block bg-brutal-yellow border-[4px] border-black shadow-brutal-md px-6 py-3 rotate-[-1deg] active-brutal transition-transform hover:rotate-0">
                <h2 className="text-xl md:text-3xl font-black text-black tracking-wide">
                  FRONTEND & AI PIPELINE
                </h2>
              </div>
            </div>
          </div>

          {/* Right Column: Content and Links (col-span-12 lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-12">
            
            {/* Bio Card */}
            <div className="bg-brutal-white border-[5px] border-black shadow-brutal-lg p-8 md:p-12 active-brutal transition-transform w-full relative">
              <div className="absolute top-0 left-0 w-full h-4 bg-brutal-blue border-b-[5px] border-black"></div>
              <h3 className="text-4xl md:text-5xl font-black mt-4 mb-8 uppercase bg-black text-white inline-block px-4 py-1 rotate-[1deg]">About Me</h3>
              <div className="space-y-8 text-xl md:text-2xl font-bold leading-relaxed text-black">
                <p>
                  AI 에이전트 파이프라인 설계와 다이나믹한 프론트엔드 엔지니어링의 세계를 탐구합니다.
                </p>
                <div className="h-[4px] bg-black w-full" />
                <p>
                  <span className="bg-brutal-green border-2 border-black px-2 block sm:inline-block w-fit shadow-brutal-sm mb-2 sm:mb-0">
                    &quot;자바스크립트 + 리액트 디자인 패턴&quot;
                  </span>
                  기술 서적 역자로 참여하였습니다.
                </p>
                <p className="text-lg md:text-xl font-black text-white bg-black p-4 border-[3px] border-black inline-block shadow-brutal-sm">
                  지속적인 기술 공유와 AI-Native 개발 워크플로우에 관심이 많습니다.
                </p>
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
              <a
                href="https://github.com/caesiumy"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-6 bg-brutal-white border-[5px] border-black shadow-brutal-md p-10 hover:bg-black hover:text-white transition-colors active-brutal text-black"
              >
                <GithubIcon />
                <span className="text-3xl font-black uppercase tracking-widest">GitHub</span>
              </a>

              <a
                href="https://linkedin.com/in/chang-sik-yoon"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-6 bg-brutal-blue border-[5px] border-black shadow-brutal-md p-10 hover:text-white transition-colors active-brutal text-black"
              >
                <LinkedinIcon />
                <span className="text-3xl font-black uppercase tracking-widest">LinkedIn</span>
              </a>

              <a
                href="https://caesiumy.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-1 sm:col-span-2 group flex flex-row items-center justify-center gap-6 bg-brutal-red border-[5px] border-black shadow-brutal-md p-10 text-white hover:bg-black transition-colors active-brutal"
              >
                <GlobeIcon />
                <span className="text-4xl font-black uppercase tracking-widest">Tech Blog</span>
              </a>
            </div>
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t-[5px] border-black bg-brutal-yellow py-10 mt-auto text-center text-xl md:text-2xl font-black uppercase shrink-0">
        <p className="text-black">
          Built with{" "}
          <span className="bg-black text-white px-3 py-1 shadow-brutal-sm inline-block rotate-[-2deg]">Next.js</span> 
          {" "}&{" "} 
          <span className="bg-white text-black px-3 py-1 border-[3px] border-black shadow-brutal-sm inline-block rotate-[2deg]">Tailwind CSS 4</span>
        </p>
      </footer>
    </div>
  );
}
