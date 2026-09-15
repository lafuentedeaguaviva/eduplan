-- =======================================================
-- MIGRACIÓN: SISTEMA DE MONETIZACIÓN Y MONEDAS (EduCoins)
-- =======================================================

-- 1. Actualizar la tabla perfiles
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS monedas_disponibles INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS ultimo_plan_comprado TEXT DEFAULT 'Gratis (Registro)';

-- 2. Crear tabla de configuración global de monetización
CREATE TABLE IF NOT EXISTS public.config_monetizacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    costo_pdc_secundaria INTEGER DEFAULT 10,
    costo_pdc_primaria INTEGER DEFAULT 15,
    costo_examen INTEGER DEFAULT 5,
    costo_autocompletar INTEGER DEFAULT 2,
    bono_registro_inicial INTEGER DEFAULT 20,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en config_monetizacion (Solo lectura para todos, escritura solo admin)
ALTER TABLE public.config_monetizacion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Configuración visible para todos" ON public.config_monetizacion FOR SELECT USING (true);

-- Insertar valores por defecto (solo si la tabla está vacía)
INSERT INTO public.config_monetizacion (costo_pdc_secundaria, costo_pdc_primaria, costo_examen, costo_autocompletar, bono_registro_inicial)
SELECT 10, 15, 5, 2, 20
WHERE NOT EXISTS (SELECT 1 FROM public.config_monetizacion);

-- 3. Crear tabla de Paquetes de Venta
CREATE TABLE IF NOT EXISTS public.paquetes_monedas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio_bob DECIMAL(10,2) NOT NULL,
    monedas_otorgadas INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0
);

ALTER TABLE public.paquetes_monedas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paquetes visibles para todos" ON public.paquetes_monedas FOR SELECT USING (activo = true);

-- Insertar paquetes por defecto
INSERT INTO public.paquetes_monedas (nombre, descripcion, precio_bob, monedas_otorgadas, orden)
SELECT 'Plan Básico', 'Ideal para maestros con poco uso mensual. ~3 PDCs Primaria o ~5 Secundaria.', 20.00, 50, 1
WHERE NOT EXISTS (SELECT 1 FROM public.paquetes_monedas WHERE nombre = 'Plan Básico');

INSERT INTO public.paquetes_monedas (nombre, descripcion, precio_bob, monedas_otorgadas, orden)
SELECT 'Plan Pro', 'El más vendido. ~10 PDCs Primaria o ~15 Secundaria.', 50.00, 150, 2
WHERE NOT EXISTS (SELECT 1 FROM public.paquetes_monedas WHERE nombre = 'Plan Pro');

INSERT INTO public.paquetes_monedas (nombre, descripcion, precio_bob, monedas_otorgadas, orden)
SELECT 'Plan Institucional', 'Uso intensivo para todo un colegio.', 350.00, 1500, 3
WHERE NOT EXISTS (SELECT 1 FROM public.paquetes_monedas WHERE nombre = 'Plan Institucional');


-- 4. Crear tabla de Pagos QR
CREATE TABLE IF NOT EXISTS public.pagos_qr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    paquete_id UUID REFERENCES public.paquetes_monedas(id),
    monto_bob DECIMAL(10,2) NOT NULL,
    comprobante_url TEXT NOT NULL,
    estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
    revisado_por UUID REFERENCES public.perfiles(id),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    fecha_revision TIMESTAMP WITH TIME ZONE
);

-- Políticas RLS para pagos QR
ALTER TABLE public.pagos_qr ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propios pagos" ON public.pagos_qr FOR SELECT USING (auth.uid() = perfil_id);
CREATE POLICY "Usuarios pueden insertar sus pagos" ON public.pagos_qr FOR INSERT WITH CHECK (auth.uid() = perfil_id);
-- (Admin policies will be needed later if doing it from client, or use service role)

-- 5. Crear tabla de Historial de Transacciones (Estado de Cuenta)
CREATE TABLE IF NOT EXISTS public.historial_transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('Recarga', 'Gasto IA', 'Bono Demo', 'Reembolso')),
    descripcion TEXT NOT NULL,
    monto_monedas INTEGER NOT NULL, -- Positivo o negativo
    saldo_resultante INTEGER NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Políticas RLS para historial
ALTER TABLE public.historial_transacciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver su propio historial" ON public.historial_transacciones FOR SELECT USING (auth.uid() = perfil_id);

-- Opcional: Función para actualizar el saldo_resultante automáticamente o se manejará desde el backend.
