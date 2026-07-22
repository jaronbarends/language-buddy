export const metadata: Metadata = {
  title: 'Language buddy',
  description: 'An AI conversation buddy for practising a foreign language',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
