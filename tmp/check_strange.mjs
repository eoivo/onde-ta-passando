
const TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZDFlNjVhZDA4ODk4ZjVmMDJmNDc1OWEzMjliYTU3YSIsIm5iZiI6MTczMjM4MDU3NC41NTksInN1YiI6IjY3NDIwNzllZmI1OGQ3NjliZGJiYjBlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Q2KERhJXYfpMAhkq3KmZu2pzTfPM32OR2bRJDHp8EFM";

async function checkStrange() {
  const ids = [284052, 453395];
  for (const id of ids) {
    const url = `https://api.themoviedb.org/3/movie/${id}?language=pt-BR`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
        Accept: "application/json",
      },
    });
    const data = await response.json();
    console.log(`Movie ID ${id} (${data.title})`);
    console.log("Belongs to Collection:", data.belongs_to_collection);
    console.log("---");
  }

  // Also search for Doctor Strange collection directly
  const searchUrl = `https://api.themoviedb.org/3/search/collection?query=Doctor%20Strange&language=pt-BR`;
  const sResp = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${TMDB_API_KEY}`,
      Accept: "application/json",
    },
  });
  const sData = await sResp.json();
  console.log("Collections found for 'Doctor Strange':");
  sData.results.forEach(c => console.log(`ID: ${c.id} - Name: ${c.name}`));
}

checkStrange();
