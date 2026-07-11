// Redondea siempre hacia arriba al peso entero (55.50 -> 56)
export function redondearArriba(numero) {
  return Math.ceil(numero - 1e-9);
}

// Calcula el precio final con IVA incluido, redondeado hacia arriba
export function precioConIva(precioSinIva, iva) {
  return redondearArriba(Number(precioSinIva) * (1 + Number(iva) / 100));
}

export function formatoPesos(numero) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(numero);
}
