import './globals.css';

export const metadata = {
  title: 'Ops Dashboard',
  description: 'Next.js version of the ops dashboard assessment'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
