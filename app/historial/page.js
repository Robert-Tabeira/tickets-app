"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatoPesos } from "@/lib/calculo";

export default function Historial() {
  const [tickets, setTickets] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [items, setItems] = useState({});
  const [cargando, setCargando] = useState(true);
  const [borrando, setBorrando] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("numero", { ascending: false })
      .limit(100);
    setTickets(data ?? []);
    setCargando(false);
  }

  async function toggleTicket(id) {
    if (abierto === id) {
      setAbierto(null);
      return;
    }
    setAbierto(id);
    if (!items[id]) {
      const { data } = await supabase
        .from("ticket_items")
        .select("*")
        .eq("ticket_id", id);
      setItems((prev) => ({ ...prev, [id]: data ?? [] }));
    }
  }

  async function eliminarTicket(id, numero) {
    if (!confirm(`¿Eliminar el ticket #${numero}? Esta acción no se puede deshacer.`)) return;
    setBorrando(id);
    // ticket_items tiene "on delete cascade", así que borrando el ticket alcanza
    const { error } = await supabase.from("tickets").delete().eq("id", id);
    setBorrando(null);
    if (!error) {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert("No se pudo eliminar: " + error.message);
    }
  }

  return (
    <div>
      <h1>Historial</h1>
      <p className="subtitle">Últimos tickets guardados, del más reciente al más antiguo.</p>

      {cargando && <p className="subtitle">Cargando…</p>}
      {!cargando && tickets.length === 0 && (
        <div className="empty">Todavía no guardaste ningún ticket.</div>
      )}

      {tickets.map((t) => (
        <div className="card" key={t.id}>
          <button
            onClick={() => toggleTicket(t.id)}
            style={{
              all: "unset",
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              cursor: "pointer",
            }}
          >
            <span>
              <strong>#{t.numero}</strong>{" "}
              <span className="pill">Lista {t.lista}</span>
            </span>
            <span>{formatoPesos(t.total)}</span>
          </button>
          <div className="item-meta" style={{ marginTop: 6 }}>
            {new Date(t.created_at).toLocaleString("es-UY")}
          </div>

          {abierto === t.id && (
            <div style={{ marginTop: 12, borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
              {(items[t.id] ?? []).map((i) => (
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
            </div>
          )}

          <div className="row" style={{ marginTop: 12 }}>
            <Link href={`/ticket/${t.id}`} className="link-btn" style={{ textDecoration: "none" }}>
              Ver / imprimir
            </Link>
            <button
              className="link-btn"
              onClick={() => eliminarTicket(t.id, t.numero)}
              disabled={borrando === t.id}
              style={{ color: "var(--stamp)" }}
            >
              {borrando === t.id ? "Eliminando…" : "Eliminar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
