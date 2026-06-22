
const supabaseUrl = "https://ggzmxejkcrajohzegxtb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE";

async function run() {
  const url = `${supabaseUrl}/rest/v1/`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (response.ok) {
    const spec = await response.json();
    console.log('pdcs_area_trabajo properties:', Object.keys(spec.definitions?.pdcs_area_trabajo?.properties || {}));
  } else {
    console.log('Error:', response.status);
  }
}

run();
