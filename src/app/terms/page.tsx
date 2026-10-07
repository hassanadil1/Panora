export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold">Terms of use</h1>
      <p>
        Panora provides an informational map of housing schemes in Lahore.
        Polygon boundaries are approximate and are not surveys, legal titles, or
        offers to sell property.
      </p>
      <p>
        Virtual tours are embedded from third parties. Panora does not guarantee
        tour availability, accuracy, or licensing beyond what editors record in
        the admin workflow.
      </p>
      <p>
        You may not scrape, bulk-download, or misrepresent scheme data. Editors
        are responsible for obtaining permission before publishing tours.
      </p>
      <p className="text-muted-foreground">
        These terms are a starter template — have counsel review before a public
        launch.
      </p>
    </main>
  );
}
