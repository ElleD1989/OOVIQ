import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata={title:'OOVIQ — Small problems. Sorted.',description:'Fast, useful digital tools for everyday life.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
