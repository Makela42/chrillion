/*
  Online settings (safe to be public).
  Fill these in after creating a free Supabase project (see README → "Supabase").
  Leave them empty and the game still works: online play falls back to a same-browser
  test mode, and the results screen skips the "better than X% of players" comparison.
*/
window.CHRILLION_ONLINE = {
  supabaseUrl: "https://egwzlshvahwdhtwtkaww.supabase.co",      // e.g. "https://abcdefgh.supabase.co"
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnd3psc2h2YWh3ZGh0d3RrYXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxMDUyODAsImV4cCI6MjExMDY4MTI4MH0.VVxSl-nM7kMwrALj8I-7izs9zm5N7MsfAyzUc9xyZD8",  // Project Settings → API → the "anon public" / publishable key
};
