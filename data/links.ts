export type Link = {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string; // PRD 기준: 구글 Favicon API를 통한 자동 연동 경로
  createdAt: string; // PRD 기준: 단순 정렬을 위한 등록 시각 (ISO string)
};

export const dummyLinks: Link[] = [
  {
    id: "link-1",
    title: "인스타그램",
    url: "https://instagram.com",
    faviconUrl: "https://www.google.com/s2/favicons?domain=instagram.com&sz=64",
    createdAt: "2024-04-01T10:00:00Z",
  },
  {
    id: "link-2",
    title: "유튜브",
    url: "https://youtube.com",
    faviconUrl: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
    createdAt: "2024-04-02T11:30:00Z",
  },
  {
    id: "link-3",
    title: "블로그",
    url: "https://velog.io",
    faviconUrl: "https://www.google.com/s2/favicons?domain=velog.io&sz=64",
    createdAt: "2024-04-03T09:15:00Z",
  },
  {
    id: "link-4",
    title: "GitHub",
    url: "https://github.com",
    faviconUrl: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    createdAt: "2024-04-04T15:45:00Z",
  },
  {
    id: "link-5",
    title: "포트폴리오",
    url: "https://myportfolio.com",
    faviconUrl: "https://www.google.com/s2/favicons?domain=myportfolio.com&sz=64",
    createdAt: "2024-04-05T18:20:00Z",
  },
];
