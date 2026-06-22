import { db } from "../src/lib/database";

async function run() {
    const { data, error } = await db.from('pdcs_area_trabajo').select('*').limit(1);
    if (error) console.error(error);
    else console.log(Object.keys(data[0] || {}));
}

run();
