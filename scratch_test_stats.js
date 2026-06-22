const { DirectorStatsService } = require('./src/services/director-stats.service.ts');

require('ts-node').register({ transpileOnly: true });

async function test() {
  const { DirectorStatsService } = require('./src/services/director-stats.service.ts');
  const res = await DirectorStatsService.getPedagogicalStats();
  console.log(JSON.stringify(res.data.momentos, null, 2));
}

test();
