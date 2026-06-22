
import { db } from './src/lib/database';

async function checkColumn() {
  const { data, error } = await db.from('planificacion_semanal').select('pdc_area_trabajo_id').limit(1);
  if (error) {
    console.error('Error selecting column:', error);
  } else {
    console.log('Column exists!');
  }
}

checkColumn();
