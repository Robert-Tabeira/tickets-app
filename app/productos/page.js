"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatoPesos } from "@/lib/calculo";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null); // id en edición
  const [borrador, setBorrador] = useState({});
  const [nuevo, setNuevo] = useState({ nombre: "", precio_lista1: "", precio_lista5: "", iva: 22 });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase.from("productos").select("*").order("nombre");
    setProductos(data ?? []);
    setCargando(false);
  }

  function empezarEdicion(p) {
    setEditando(p.id);
    setBorrador({
      nombre: p.nombre,
      precio_lista1: p.precio_lista1 ?? "",
      precio_lista5: p.precio_lista5 ?? "",
      iva: p.iva,
    });
  }

  async function guardarEdicion(id) {
    const { data, error } = await supabase
      .from("productos")
      .update({
        nombre: borrador.nombre,
        precio_lista1: borrador.precio_lista1 === "" ? null : parseFloat(borrador.precio_lista1),
        precio_lista5: borrador.precio_lista5 === "" ? null : parseFloat(borrador.precio_lista5),
        iva: parseInt(borrador.iva),
      })
      .eq("id", id)
      .select()
      .single();
    if (!error) {
      setProductos((prev) => prev.map((p) => (p.id === id ? data : p)));
      setEditando(null);
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;
    await supabase.from("productos").delete().eq("id", id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }

  async function agregarNuevo() {
    if (!nuevo.nombre.trim()) {
      setMsg({ tipo: "error", texto: "Ingresá un nombre." });
      return;
    }
    const { data, error } = await supabase
      .from("productos")
      .insert({
        nombre: nuevo.nombre.trim(),
        precio_lista1: nuevo.precio_lista1 === "" ? null : parseFloat(nuevo.precio_lista1),
        precio_lista5: nuevo.precio_lista5 === "" ? null : parseFloat(nuevo.precio_lista5),
        iva: parseInt(nuevo.iva),
      })
      .select()
      .single();
    if (error) {
      setMsg({ tipo: "error", texto: error.message });
      return;
    }
    setProductos((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setNuevo({ nombre: "", precio_lista1: "", precio_lista5: "", iva: 22 });
    setMsg({ tipo: "ok", texto: "Producto agregado." });
  }

  return (
    <div>
      <h1>Precios guardados</h1>
      <p className="subtitle">Catálogo de artículos con precio sin IVA para la Lista 1 y la Lista 5.</p>

      {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}

      <div className="card">
        <h2>Agregar producto</h2>
        <div className="field">
          <label>Nombre</label>
          <input
            type="text"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            placeholder="Ej: Pan de molde"
          />
        </div>
        <div className="row">
          <div className="field">
            <label>Precio Lista 1 (sin IVA)</label>
            <input
              type="number"
              value={nuevo.precio_lista1}
              onChange={(e) => setNuevo({ ...nuevo, precio_lista1: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Precio Lista 5 (sin IVA)</label>
            <input
              type="number"
              value={nuevo.precio_lista5}
              onChange={(e) => setNuevo({ ...nuevo, precio_lista5: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label>IVA</label>
          <div className="iva-choice">
            <label className={nuevo.iva === 22 ? "checked" : ""}>
              <input
                type="radio"
                checked={nuevo.iva === 22}
                onChange={() => setNuevo({ ...nuevo, iva: 22 })}
              />
              Básico · 22%
            </label>
            <label className={nuevo.iva === 10 ? "checked" : ""}>
              <input
                type="radio"
                checked={nuevo.iva === 10}
                onChange={() => setNuevo({ ...nuevo, iva: 10 })}
              />
              Mínimo · 10%
            </label>
          </div>
        </div>
        <button className="btn" onClick={agregarNuevo}>
          + Guardar producto
        </button>
      </div>

      <h2>Catálogo ({productos.length})</h2>
      {cargando && <p className="subtitle">Cargando…</p>}
      {!cargando && productos.length === 0 && (
        <div className="empty">Todavía no guardaste ningún precio.</div>
      )}

      {productos.map((p) => (
        <div className="card" key={p.id}>
          {editando === p.id ? (
            <>
              <div className="field">
                <label>Nombre</label>
                <input
                  type="text"
                  value={borrador.nombre}
                  onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })}
                />
              </div>
              <div className="row">
                <div className="field">
                  <label>Lista 1</label>
                  <input
                    type="number"
                    value={borrador.precio_lista1}
                    onChange={(e) => setBorrador({ ...borrador, precio_lista1: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Lista 5</label>
                  <input
                    type="number"
                    value={borrador.precio_lista5}
                    onChange={(e) => setBorrador({ ...borrador, precio_lista5: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>IVA</label>
                <div className="iva-choice">
                  <label className={parseInt(borrador.iva) === 22 ? "checked" : ""}>
                    <input
                      type="radio"
                      checked={parseInt(borrador.iva) === 22}
                      onChange={() => setBorrador({ ...borrador, iva: 22 })}
                    />
                    22%
                  </label>
                  <label className={parseInt(borrador.iva) === 10 ? "checked" : ""}>
                    <input
                      type="radio"
                      checked={parseInt(borrador.iva) === 10}
                      onChange={() => setBorrador({ ...borrador, iva: 10 })}
                    />
                    10%
                  </label>
                </div>
              </div>
              <div className="row">
                <button className="btn" onClick={() => guardarEdicion(p.id)}>
                  Guardar
                </button>
                <button className="btn secondary" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong>{p.nombre}</strong>
                <span className="pill">IVA {p.iva}%</span>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <div>
                  <div className="item-meta">Lista 1</div>
                  <div>{p.precio_lista1 != null ? formatoPesos(p.precio_lista1) : "—"}</div>
                </div>
                <div>
                  <div className="item-meta">Lista 5</div>
                  <div>{p.precio_lista5 != null ? formatoPesos(p.precio_lista5) : "—"}</div>
                </div>
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="link-btn" onClick={() => empezarEdicion(p)}>
                  Editar
                </button>
                <button className="link-btn" onClick={() => eliminar(p.id)}>
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
