import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 p-8">
      <main className="flex flex-col items-center max-w-2xl w-full text-center gap-8">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl">
             <span className="text-4xl">👨‍💻</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            윤창식 (Chang-sik Yoon)
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 font-medium">
            Frontend Engineer & AI Agent Pipeline Designer
          </p>
        </div>

        {/* Bio / Description */}
        <div className="space-y-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>
            AI 에이전트 파이프라인 설계와 프론트엔드 엔지니어링의 접점을 탐구합니다. 
            AI-Native 개발 워크플로우와 자동화에 깊은 관심을 가지고 활동하고 있습니다.
          </p>
          <p>
            기술 서적 <span className="font-semibold text-zinc-900 dark:text-zinc-100">"자바스크립트 + 리액트 디자인 패턴"</span>의 역자로 참여하며 
            지식 공유와 기술 전파에 기여하고 있습니다.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <a
            href="https://github.com/caesiumy"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 rounded-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/chang-sik-yoon"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-900 dark:text-zinc-300"
          >
            LinkedIn
          </a>
          <a
            href="https://caesiumy.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-900 dark:text-zinc-300"
          >
            Blog
          </a>
        </div>

        {/* Footer info */}
        <footer className="mt-12 text-sm text-zinc-400 dark:text-zinc-600">
          Built with Next.js & Tailwind CSS
        </footer>
      </main>
    </div>
  );
}
