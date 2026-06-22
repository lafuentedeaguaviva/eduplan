
const supabaseUrl = "https://ggzmxejkcrajohzegxtb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE";

async function run() {
  const url = `${supabaseUrl}/rest/v1/pdcs_area_trabajo?limit=1`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    if (data.length > 0) {
      console.log('Columns in pdcs_area_trabajo:', Object.keys(data[0]));
    } else {
      console.log('No data in pdcs_area_trabajo');
    }
  } else {
    console.log('Error:', response.status);
  }
}

run();
