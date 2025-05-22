import type { Metadata } from 'next';
import { Noto_Serif_KR, Noto_Sans_KR, Nanum_Gothic, Nanum_Myeongjo, Nanum_Pen_Script, Gaegu, Black_Han_Sans, Do_Hyeon, Jua, Poor_Story } from 'next/font/google';
import './globals.css';

const notoSerifKR = Noto_Serif_KR({
  weight: ['200', '300', '400', '500', '600', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

const notoSansKR = Noto_Sans_KR({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

const nanumGothic = Nanum_Gothic({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nanum-gothic',
});

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nanum-myeongjo',
});

const nanumPen = Nanum_Pen_Script({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nanum-pen',
});

const gaegu = Gaegu({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gaegu',
});

const blackHanSans = Black_Han_Sans({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-black-han-sans',
});

const doHyeon = Do_Hyeon({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-do-hyeon',
});

const jua = Jua({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jua',
});

const poorStory = Poor_Story({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poor-story',
});

export const metadata: Metadata = {
  title: 'Ver-B-ID',
  description: 'Ver-B-ID',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`
      ${notoSerifKR.variable}
      ${notoSansKR.variable}
      ${nanumGothic.variable}
      ${nanumMyeongjo.variable}
      ${nanumPen.variable}
      ${gaegu.variable}
      ${blackHanSans.variable}
      ${doHyeon.variable}
      ${jua.variable}
      ${poorStory.variable}
    `}>
      <head>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
