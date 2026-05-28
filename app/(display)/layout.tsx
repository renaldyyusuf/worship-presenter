export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="overflow-hidden bg-black">
        {children}
      </body>
    </html>
  )
}
