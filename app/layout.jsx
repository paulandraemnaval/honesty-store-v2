import "@/styles/globals.css";
export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body className="h-[100vh] w-full font-inter">{children}</body>
    </html>
  );
}
