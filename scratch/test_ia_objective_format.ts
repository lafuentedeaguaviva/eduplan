import { db } from './src/lib/database';

async function test() {
    const { data } = await db.from('pdcs_area_trabajo').select('objetivo_estrategico, objetivo_estrategico_ia').limit(3);
    console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error);
