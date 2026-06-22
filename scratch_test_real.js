const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAlias('@', path.join(__dirname, 'src'));
require('ts-node').register({ transpileOnly: true });

async function run() {
  try {
      const { DirectorStatsService } = require('./src/services/director-stats.service.ts');
      // We will use the known director id from earlier
      const res = await DirectorStatsService.getPedagogicalStats('65e6c7a4-7ab3-4e19-9640-ca13e1179a70');
      
      console.log('momentos.practica length:', res.data?.momentos?.practica?.length);
      console.log('momentos.practica:', res.data?.momentos?.practica);
      console.log('Error:', res.error);
  } catch (e) {
      console.error(e);
  }
}
run();
