import "./globals.css";

export const metadata = {
  title: "SHPE UB Member Portal",
  description: "Member portal for the SHPE chapter at the University at Buffalo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
