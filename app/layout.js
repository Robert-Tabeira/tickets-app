import "./globals.css";

export const metadata = {
  title: "Tickets",
  description: "Generador de tickets de venta",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <a href="/" className="brand">
              <span className="brand-mark">#</span> Tickets
            </a>
            <nav className="topnav">
              <a href="/">Nuevo</a>
              <a href="/historial">Historial</a>
              <a href="/productos">Precios</a>
              <a href="/configuracion">Ajustes</a>
            </nav>
          </header>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
