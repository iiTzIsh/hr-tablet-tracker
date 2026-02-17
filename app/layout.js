import './globals.css';

export const metadata = {
  title: 'HR Tablet Tracker',
  description: 'Track tablet and pen usage in the HR Department',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#2563eb',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
