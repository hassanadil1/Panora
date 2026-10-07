export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold">Privacy</h1>
      <p>
        Panora collects account information through Supabase Auth when you sign
        in, and optional analytics events (map interactions, tour opens) to
        improve the product. We do not sell personal data.
      </p>
      <p>
        Favourites are stored per authenticated user and are not visible to
        other users. Anonymous visitors may receive a random analytics ID stored
        in browser local storage.
      </p>
      <p>
        Map tiles and styles are provided by Mapbox under their terms. Embedded
        tours are loaded from third-party hosts listed in our allowlist; those
        providers may collect usage data according to their own policies.
      </p>
      <p className="text-muted-foreground">
        Contact: privacy@panora.example — replace with your production contact
        before launch.
      </p>
    </main>
  );
}
