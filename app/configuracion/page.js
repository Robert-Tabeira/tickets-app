"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Configuracion() {
  const [proximoTicket, setProximoTicket] = useState("");
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase.from("configuracion").select("*").eq("id", 1).single();
    setProximoTicket(data?.proximo_ticket ?? 1);
    setCargando(false);
  }

  async function guardar() {
    const valor = parseInt(proximoTicket);
    if (isNaN(valor) || valor <= 0) {
      setMsg({ tipo: "error", texto: "Ingresá un número válido." });
      return;
    }
    const { error } = await supabase
      .from("configuracion")
      .update({ proximo_ticket: valor })
      .eq("id", 1);
    if (error) {
      setMsg({ tipo: "error", texto: error.message });
    } else {
      setMsg({ tipo: "ok", texto: "Número de ticket actualizado." });
    }
  }

  if (cargando) return <p className="subtitle">Cargando…</p>;

  return (
    <div>
      <h1>Ajustes</h1>
      <p className="subtitle">
        Definí el próximo número de ticket. A partir de ahí, cada ticket que guardes sumará uno automáticamente.
      </p>

      {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}

      <div className="card">
        <div className="field">
          <label>Próximo número de ticket</label>
          <input
            type="number"
            value={proximoTicket}
            onChange={(e) => setProximoTicket(e.target.value)}
          />
        </div>
        <button className="btn" onClick={guardar}>
          Guardar
        </button>
      </div>
    </div>
  );
}
