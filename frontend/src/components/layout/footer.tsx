import { NewsletterForm } from "@/components/ui/newsletter-form";
import { OutboundLink } from "@/components/ui/utm-link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="font-semibold">NaijaCare Pharmacy</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Trusted medicine ordering and fulfilment for Nigeria.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Support</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Email: help@naijacare.example</li>
            <li>Phone: +234 800 000 0000</li>
            <li>
              <OutboundLink href="https://www.nafdac.gov.ng/">NAFDAC Guidelines</OutboundLink>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Newsletter</h3>
          <NewsletterForm />
        </div>
      </div>
    </footer>
  );
}
