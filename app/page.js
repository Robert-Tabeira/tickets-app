"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { precioConIva, formatoPesos } from "@/lib/calculo";

export default function NuevoTicket() {
  const [lista, setLista] = useState(1);
  const [numeroTicket, setNumeroTicket] = useState(null);
  const [items, setItems] = useState([]);
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [iva, setIva] = useState(22);
  const [cantidad, setCantidad] = useState(1);
  const [guardarEnCatalogo, setGuardarEnCatalogo] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [msg, setMsg] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [ultimoTicketId, setUltimoTicketId] = useState(null);

  useEffect(() => {
    cargarInicial();
  }, []);

  async function cargarInicial() {
    setCargando(true);
    const [{ data: config }, { data: prods }] = await Promise.all([
      supabase.from("configuracion").select("*").eq("id", 1).single(),
      supabase.from("productos").select("*").order("nombre"),
    ]);
    setNumeroTicket(config?.proximo_ticket ?? 1);
    setProductos(prods ?? []);
    setCargando(false);
  }

  const sugerencias = useMemo(() => {
    if (!nombre || productoSeleccionado) return [];
    const q = nombre.toLowerCase();
    return productos
      .filter((p) => p.nombre.toLowerCase().includes(q))
      .slice(0, 5);
  }, [nombre, productos, productoSeleccionado]);

  function elegirProducto(p) {
    setProductoSeleccionado(p);
    setNombre(p.nombre);
    const precioLista = lista === 1 ? p.precio_lista1 : p.precio_lista5;
    setPrecio(precioLista != null ? String(precioLista) : "");
    setIva(p.iva);
  }

  function cambiarLista(nuevaLista) {
    setLista(nuevaLista);
    if (productoSeleccionado) {
      const precioLista =
        nuevaLista === 1
          ? productoSeleccionado.precio_lista1
          : productoSeleccionado.precio_lista5;
      setPrecio(precioLista != null ? String(precioLista) : "");
    }
  }

  function limpiarFormItem() {
    setNombre("");
    setPrecio("");
    setIva(22);
    setCantidad(1);
    setProductoSeleccionado(null);
    setGuardarEnCatalogo(true);
  }

  async function agregarItem() {
    const precioNum = parseFloat(precio);
    const cantidadNum = parseFloat(cantidad) || 1;
    if (!nombre.trim() || isNaN(precioNum) || precioNum <= 0) {
      setMsg({ tipo: "error", texto: "Ingresá un nombre y un precio válido." });
      return;
    }

    const precioUnitConIva = precioConIva(precioNum, iva);
    const totalLinea = precioUnitConIva * cantidadNum;

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nombre: nombre.trim(),
        precio_unitario: precioNum,
        iva,
        precio_con_iva: precioUnitConIva,
        cantidad: cantidadNum,
        total_linea: totalLinea,
      },
    ]);

    // Guardar/actualizar en catálogo si corresponde
    if (guardarEnCatalogo) {
      await guardarProductoEnCatalogo(nombre.trim(), precioNum, iva, lista);
    }

    limpiarFormItem();
    setMsg(null);
  }

  async function guardarProductoEnCatalogo(nombreProd, precioNum, ivaNum, listaNum) {
    const existente = productos.find(
      (p) => p.nombre.toLowerCase() === nombreProd.toLowerCase()
    );
    const campoLista = listaNum === 1 ? "precio_lista1" : "precio_lista5";

    if (existente) {
      const { data } = await supabase
        .from("productos")
        .update({ [campoLista]: precioNum, iva: ivaNum })
        .eq("id", existente.id)
        .select()
        .single();
      setProductos((prev) =>
        prev.map((p) => (p.id === existente.id ? data : p))
      );
    } else {
      const { data } = await supabase
        .from("productos")
        .insert({ nombre: nombreProd, [campoLista]: precioNum, iva: ivaNum })
        .select()
        .single();
      if (data) setProductos((prev) => [...prev, data]);
    }
  }

  function quitarItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const total = items.reduce((acc, i) => acc + i.total_linea, 0);

  async function finalizarTicket() {
    if (items.length === 0) {
      setMsg({ tipo: "error", texto: "Agregá al menos un artículo." });
      return;
    }
    setGuardando(true);
    setMsg(null);
    try {
      const { data: ticket, error: errTicket } = await supabase
        .from("tickets")
        .insert({ numero: numeroTicket, lista, total })
        .select()
        .single();
      if (errTicket) throw errTicket;

      const filas = items.map((i) => ({
        ticket_id: ticket.id,
        nombre: i.nombre,
        precio_unitario: i.precio_unitario,
        iva: i.iva,
        precio_con_iva: i.precio_con_iva,
        cantidad: i.cantidad,
        total_linea: i.total_linea,
      }));
      const { error: errItems } = await supabase.from("ticket_items").insert(filas);
      if (errItems) throw errItems;

      const siguiente = numeroTicket + 1;
      await supabase
        .from("configuracion")
        .update({ proximo_ticket: siguiente })
        .eq("id", 1);

      setNumeroTicket(siguiente);
      setItems([]);
      setUltimoTicketId(ticket.id);
      setMsg({ tipo: "ok", texto: `Ticket #${ticket.numero} guardado correctamente.` });
    } catch (e) {
      setMsg({ tipo: "error", texto: "No se pudo guardar el ticket. " + e.message });
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="subtitle">Cargando…</p>;
  }

  return (
    <div>
      <h1>Nuevo ticket</h1>
      <p className="subtitle">Agregá los artículos que la persona está comprando.</p>

      {msg && (
        <div className={`msg ${msg.tipo}`}>
          {msg.texto}
          {msg.tipo === "ok" && ultimoTicketId && (
            <>
              {" "}
              <Link href={`/ticket/${ultimoTicketId}`} style={{ color: "inherit", fontWeight: 600 }}>
                Ver / imprimir →
              </Link>
            </>
          )}
        </div>
      )}

      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>N° de ticket</label>
            <input
              type="number"
              value={numeroTicket ?? ""}
              onChange={(e) => setNumeroTicket(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Lista de precios</label>
            <div className="toggle-group">
              <button
                type="button"
                className={lista === 1 ? "active" : ""}
                onClick={() => cambiarLista(1)}
              >
                Lista 1
              </button>
              <button
                type="button"
                className={lista === 5 ? "active" : ""}
                onClick={() => cambiarLista(5)}
              >
                Lista 5
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Agregar artículo</h2>

        <div className="field">
          <label>Nombre del producto</label>
          <input
            type="text"
            value={nombre}
            placeholder="Ej: Pan de molde"
            onChange={(e) => {
              setNombre(e.target.value);
              setProductoSeleccionado(null);
            }}
          />
        </div>
        {sugerencias.length > 0 && (
          <div className="suggestions" style={{ marginBottom: 12 }}>
            {sugerencias.map((p) => (
              <button key={p.id} type="button" onClick={() => elegirProducto(p)}>
                <span>{p.nombre}</span>
                <span className="pill">IVA {p.iva}%</span>
              </button>
            ))}
          </div>
        )}

        <div className="row">
          <div className="field">
            <label>Precio sin IVA ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={precio}
              placeholder="0"
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Cantidad</label>
            <input
              type="number"
              inputMode="decimal"
              value={cantidad}
              min="1"
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>IVA</label>
          <div className="iva-choice">
            <label className={iva === 22 ? "checked" : ""}>
              <input
                type="radio"
                name="iva"
                checked={iva === 22}
                onChange={() => setIva(22)}
              />
              Básico · 22%
            </label>
            <label className={iva === 10 ? "checked" : ""}>
              <input
                type="radio"
                name="iva"
                checked={iva === 10}
                onChange={() => setIva(10)}
              />
              Mínimo · 10%
            </label>
          </div>
        </div>

        {precio && !isNaN(parseFloat(precio)) && (
          <p className="subtitle" style={{ margin: "0 0 12px" }}>
            Precio final con IVA: <strong>{formatoPesos(precioConIva(parseFloat(precio), iva))}</strong> c/u
          </p>
        )}

        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
          <input
            type="checkbox"
            checked={guardarEnCatalogo}
            onChange={(e) => setGuardarEnCatalogo(e.target.checked)}
          />
          Guardar este precio en la Lista {lista} para la próxima vez
        </label>

        <button className="btn" onClick={agregarItem}>
          + Agregar al ticket
        </button>
      </div>

      <h2>Ticket actual</h2>
      <div className="ticket">
        <div className="ticket-head">
          <span className="num">#{numeroTicket}</span>
          <span className="lista-badge">Lista {lista}</span>
        </div>

        {items.length === 0 && <div className="empty">Todavía no agregaste artículos.</div>}

        {items.map((i) => (
          <div className="item-row" key={i.id}>
            <div className="item-main">
              <div className="item-name">{i.nombre}</div>
              <div className="item-meta">
                {i.cantidad} x {formatoPesos(i.precio_con_iva)} (IVA {i.iva}%)
              </div>
            </div>
            <div className="item-amount">
              {formatoPesos(i.total_linea)}
              <button className="item-remove" onClick={() => quitarItem(i.id)} aria-label="Quitar">
                ×
              </button>
            </div>
          </div>
        ))}

        <div className="total-row">
          <span className="label">Total</span>
          <span className="amount">{formatoPesos(total)}</span>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn stamp" onClick={finalizarTicket} disabled={guardando}>
          {guardando ? "Guardando…" : "Finalizar y guardar ticket"}
        </button>
      </div>
    </div>
  );
}
