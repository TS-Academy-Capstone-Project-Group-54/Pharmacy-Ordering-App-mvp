import { FAQSection } from "@/components/ui/faq";
import { OutboundLink } from "@/components/ui/utm-link";
import { faqs, healthTips } from "@/data/site-content";
import { safeDate } from "@/lib/utils";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">About NaijaCare Pharmacy Ordering</h1>
        <p className="mt-3 max-w-3xl text-slate-700 dark:text-slate-300">
          NaijaCare helps customers across Nigeria browse trusted medicines, place orders in Naira, and track fulfilment.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">How it works</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Create account and login.</li>
          <li>Browse medicine catalogue with search and category filters.</li>
          <li>Checkout and place order.</li>
          <li>Track order from Pending to Delivered.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Health updates</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {healthTips.map((post) => (
            <article key={post.title} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
              <p className="mt-2 text-xs text-slate-500">Last updated: {safeDate(post.lastUpdated)}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">FAQs</h2>
        <FAQSection items={faqs} />
      </section>

      <section>
        <h2 className="text-xl font-semibold">Useful links</h2>
        <p className="mt-2 text-sm">
          Read more from <OutboundLink href="https://www.who.int/">WHO</OutboundLink> and <OutboundLink href="https://www.nafdac.gov.ng/">NAFDAC</OutboundLink>.
        </p>
      </section>
    </div>
  );
}
