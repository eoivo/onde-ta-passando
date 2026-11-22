import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Cake, MapPin, Film, User } from "lucide-react";
import { getPersonDetails } from "@/services/tmdb-api";
import LoadingReset from "@/components/LoadingReset";
import ShareButton from "@/components/ShareButton";
import PersonBiography from "@/components/PersonBiography";
import PersonFilmography from "@/components/PersonFilmography";

export const dynamicParams = true;
export const revalidate = 3600;

const DEPARTMENTS: Record<string, string> = {
  Acting: "Atuação",
  Directing: "Direção",
  Writing: "Roteiro",
  Production: "Produção",
  Sound: "Música",
  Camera: "Fotografia",
  Editing: "Edição",
  Creator: "Criação",
};

// Gêneros de TV que são participações "como ele mesmo" (talk shows, notícias, reality)
const NOISE_GENRES = [10767, 10763, 10764];

function formatDate(date?: string | null) {
  if (!date) return null;
  const d = new Date(date + "T12:00:00");
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function calcAge(birthday?: string | null, deathday?: string | null) {
  if (!birthday) return null;
  const birth = new Date(birthday + "T12:00:00");
  const end = deathday ? new Date(deathday + "T12:00:00") : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const person = await getPersonDetails(id);
    if (!person?.id) return { title: "Pessoa" };

    const title = `${person.name} — filmografia e onde assistir`;
    const description =
      person.biography?.slice(0, 160) ||
      `Veja filmes e séries de ${person.name} e descubra onde assistir no streaming.`;
    const image = person.profile_path
      ? `https://image.tmdb.org/t/p/h632${person.profile_path}`
      : "/images/logos/icon_full_name.png";

    return {
      title,
      description,
      alternates: { canonical: `/pessoa/${id}` },
      openGraph: {
        type: "profile",
        title: `${title} | Onde Tá Passando?`,
        description,
        url: `/pessoa/${id}`,
        images: [{ url: image, alt: person.name }],
      },
      twitter: {
        card: "summary",
        title: `${title} | Onde Tá Passando?`,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: "Pessoa" };
  }
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPersonDetails(id);

  if (!person || !person.id || !person.name) {
    notFound();
  }

  const cast: any[] = person.combined_credits?.cast || [];
  const crew: any[] = person.combined_credits?.crew || [];

  // Atuação: remove participações "como ele mesmo" e duplicatas
  const seenCast = new Set<string>();
  const acting = cast.filter((c) => {
    if (!c.poster_path) return false;
    if (c.media_type !== "movie" && c.media_type !== "tv") return false;
    if (c.media_type === "tv" && (c.genre_ids || []).some((g: number) => NOISE_GENRES.includes(g))) return false;
    if (/\b(self|himself|herself|themselves)\b/i.test(c.character || "")) return false;
    const key = `${c.media_type}-${c.id}`;
    if (seenCast.has(key)) return false;
    seenCast.add(key);
    return true;
  });

  // Direção: apenas Director (filmes/séries) e Creator
  const seenCrew = new Set<string>();
  const directing = crew.filter((c) => {
    if (!c.poster_path) return false;
    if (c.media_type !== "movie" && c.media_type !== "tv") return false;
    if (c.job !== "Director" && c.job !== "Creator") return false;
    const key = `${c.media_type}-${c.id}`;
    if (seenCrew.has(key)) return false;
    seenCrew.add(key);
    return true;
  });

  const age = calcAge(person.birthday, person.deathday);
  const birthday = formatDate(person.birthday);
  const deathday = formatDate(person.deathday);
  const department = DEPARTMENTS[person.known_for_department] || person.known_for_department;
  const totalTitles = new Set([...acting, ...directing].map((c) => `${c.media_type}-${c.id}`)).size;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    image: person.profile_path ? `https://image.tmdb.org/t/p/h632${person.profile_path}` : undefined,
    birthDate: person.birthday || undefined,
    deathDate: person.deathday || undefined,
    birthPlace: person.place_of_birth || undefined,
    description: person.biography?.slice(0, 300) || undefined,
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoadingReset />

      {/* Faixa decorativa */}
      <div className="relative h-40 md:h-56 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0808] via-[#2a0d0d] to-black" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #e8374a 0px, #e8374a 1px, transparent 1px, transparent 20px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />
      </div>

      <div className="relative z-10 px-4 md:px-12 max-w-[1600px] mx-auto -mt-24 md:-mt-32 pb-20 space-y-12">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          <div className="relative w-[180px] md:w-[260px] aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 flex-shrink-0">
            {person.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                alt={person.name}
                fill
                priority
                sizes="260px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-neutral-700" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left space-y-5 md:pt-24">
            <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              <div className="flex flex-col items-center md:items-start gap-3">
                {department && (
                  <span className="h-7 px-3 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-[11px] font-bold uppercase tracking-wider inline-flex items-center leading-none">
                    {department}
                  </span>
                )}
                <h1 className="font-bebas text-5xl md:text-7xl text-white uppercase tracking-wider leading-none drop-shadow-lg">
                  {person.name}
                </h1>
              </div>
              <ShareButton title={person.name} />
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              {birthday && (
                <div className="h-8 px-3.5 bg-white/[0.04] border border-white/10 rounded-full inline-flex items-center gap-2 leading-none">
                  <Cake className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider leading-none">
                    {birthday}
                    {age !== null && !deathday && ` • ${age} anos`}
                  </span>
                </div>
              )}
              {deathday && (
                <div className="h-8 px-3.5 bg-white/[0.04] border border-white/10 rounded-full inline-flex items-center gap-2 leading-none">
                  <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider leading-none">
                    Faleceu em {deathday}
                    {age !== null && ` • ${age} anos`}
                  </span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="h-8 px-3.5 bg-white/[0.04] border border-white/10 rounded-full inline-flex items-center gap-2 leading-none max-w-full">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider leading-none truncate">
                    {person.place_of_birth}
                  </span>
                </div>
              )}
              {totalTitles > 0 && (
                <div className="h-8 px-3.5 bg-white/[0.04] border border-white/10 rounded-full inline-flex items-center gap-2 leading-none">
                  <Film className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider leading-none">
                    {totalTitles} títulos
                  </span>
                </div>
              )}
            </div>

            {person.biography ? (
              <PersonBiography
                text={person.biography}
                isEnglish={person.biography_lang === "en"}
              />
            ) : (
              <p className="text-sm text-neutral-500">Biografia não disponível.</p>
            )}
          </div>
        </div>

        <PersonFilmography acting={acting} directing={directing} />
      </div>
    </main>
  );
}
