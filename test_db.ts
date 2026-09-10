import { db } from './src/lib/database';

async function test() {
    console.log("Checking perfiles column...");
    const { data: cols } = await db.from('perfiles').select('unidad_educativa_id').limit(5);
    console.log("perfiles:", cols);

    const { data: uep } = await db.from('unidad_educativa_personal').select('*').limit(5);
    console.log("unidad_educativa_personal:", uep);

    const { data: areas } = await db.from('areas_trabajo').select('profesor_id, unidad_educativa_id').limit(5);
    console.log("areas_trabajo:", areas);
}
test();
