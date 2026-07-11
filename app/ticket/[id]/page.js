"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatoPesos } from "@/lib/calculo";

export default function VistaTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar();
  }, [id]);

  async function cargar() {
    setCargando(true);
    const [{ data: t, error: errT }, { data: its }] = await Promise.all([
      supabase.from("tickets").select("*").eq("id", id).single(),
      supabase.from("ticket_items").select("*").eq("ticket_id", id),
    ]);
    if (errT || !t) {
      setError("No se encontró este ticket.");
    } else {
      setTicket(t);
      setItems(its ?? []);
    }
    setCargando(false);
  }

  function imprimir() {
    window.print();
  }

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket #${ticket.numero}`,
          text: `Ticket #${ticket.numero} — Total ${formatoPesos(ticket.total)}`,
          url: window.location.href,
        });
      } catch {
        // el usuario canceló, no hacemos nada
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copiado al portapapeles.");
    }
  }

  if (cargando) return <p className="subtitle">Cargando…</p>;
  if (error) return <div className="empty">{error}</div>;

  return (
    <div>
      <div className="no-print" style={{ marginBottom: 16 }}>
        <Link href="/historial" className="link-btn" style={{ padding: 0 }}>
          ← Volver al historial
        </Link>
      </div>

      <div className="ticket print-area">
        <div className="ticket-head">
          <span className="num">#{ticket.numero}</span>
          <span className="lista-badge">Lista {ticket.lista}</span>
        </div>

        <div className="item-meta" style={{ marginBottom: 10 }}>
          {new Date(ticket.created_at).toLocaleString("es-UY")}
        </div>

        {items.length === 0 && <div className="empty">Este ticket no tiene artículos.</div>}

        {items.map((i) => (
          <div className="item-row" key={i.id}>
            <div className="item-main">
              <div className="item-name">{i.nombre}</div>
              <div className="item-meta">
                {i.cantidad} x {formatoPesos(i.precio_con_iva)} (IVA {i.iva}%)
              </div>
            </div>
            <div className="item-amount">{formatoPesos(i.total_linea)}</div>
          </div>
        ))}

        <div className="total-row">
          <span className="label">Total</span>
          <span className="amount">{formatoPesos(ticket.total)}</span>
        </div>
      </div>

      <div className="row no-print" style={{ marginTop: 16 }}>
        <button className="btn" onClick={imprimir}>
          🖨️ Imprimir
        </button>
        <button className="btn secondary" onClick={compartir}>
          Compartir / copiar link
        </button>
      </div>
      <p className="subtitle no-print" style={{ marginTop: 10 }}>
        También podés mostrarle esta pantalla al cliente para que le saque una foto.
      </p>
    </div>
  );
}
