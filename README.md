# Tickets — app de venta con IVA

App simple para generar tickets de venta: cargás artículos con su precio sin
IVA, elegís IVA básico (22%) o mínimo (10%), y calcula el precio final
redondeando siempre hacia arriba al peso. Guarda un catálogo de precios en
dos listas (Lista 1 y Lista 5) para no tener que volver a tipearlos, y lleva
la numeración consecutiva de tickets.

## 1. Crear el proyecto en Supabase (guarda los datos)

1. Entrá a https://supabase.com y creá una cuenta (podés hacerlo desde el
   celular, en el navegador).
2. Creá un proyecto nuevo (elegí cualquier nombre y contraseña de base de
   datos, guardala en un lugar seguro).
3. Andá a **SQL Editor** → **New query**, pegá todo el contenido del archivo
   `supabase/schema.sql` de esta carpeta, y tocá **Run**. Esto crea las 4
   tablas necesarias (`productos`, `configuracion`, `tickets`,
   `ticket_items`).
4. Andá a **Project Settings** → **API**. Ahí vas a encontrar:
   - **Project URL** → esto va en `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → esto va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Subir el código a GitHub

1. Creá una cuenta en https://github.com si no tenés.
2. Creá un repositorio nuevo (puede ser privado) y subí todo el contenido de
   esta carpeta. La forma más simple desde el celular es usar la app de
   GitHub o la web, arrastrando/subiendo los archivos; si tenés acceso a una
   computadora es más cómodo usar `git push`.

## 3. Desplegar en Vercel

1. Entrá a https://vercel.com y creá una cuenta (podés iniciar sesión
   directamente con tu cuenta de GitHub).
2. Tocá **Add New… → Project** e importá el repositorio que acabás de subir.
3. En **Environment Variables**, agregá:
   - `NEXT_PUBLIC_SUPABASE_URL` = (el Project URL de Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (el anon public key de Supabase)
4. Tocá **Deploy**. En un par de minutos Vercel te da un link (algo como
   `https://tickets-app-tuusuario.vercel.app`).
5. Abrí ese link desde el navegador de tu celular y, opcionalmente, agregalo
   a la pantalla de inicio ("Agregar a pantalla de inicio") para que se
   sienta como una app.

Cada vez que quieras modificar algo del código, subiendo el cambio a GitHub
Vercel vuelve a desplegar automáticamente.

## Cómo se usa

- **Nuevo**: pantalla principal. Elegís la Lista (1 o 5), vas escribiendo el
  nombre del producto (si ya lo cargaste antes te va a sugerir el precio
  guardado), ponés el precio sin IVA, elegís IVA básico o mínimo, y tocás
  "Agregar al ticket". Repetís por cada artículo y al final tocás
  "Finalizar y guardar ticket". El número de ticket sube solo para la
  próxima venta.
- **Precios**: catálogo completo de productos guardados, con precio para
  Lista 1 y Lista 5. Se puede editar o borrar cualquier producto.
- **Historial**: lista de tickets ya generados, con el detalle de cada uno.
- **Ajustes**: para fijar el número inicial de ticket (por ejemplo 486134).

## Notas

- Los precios que cargás en la pantalla "Nuevo" se guardan automáticamente
  en el catálogo (podés destildar la casilla si no querés guardar un precio
  puntual).
- El redondeo siempre es hacia arriba: $55,50 con IVA se convierte en $56.
- Esta app no tiene usuario/contraseña: cualquiera que tenga el link puede
  usarla. Como es de uso personal alcanza, pero no compartas el link
  públicamente. Si más adelante querés agregarle una clave de acceso,
  se puede sumar fácilmente.
