import { getDictionary } from '@/i18n/getDictionary';

export default async function ContactPage(props) {
  const params = await props.params;
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);
  const contact = dict.contact || {};

  return (
    <div className="page-shell page-contact">
      <section className="page-hero-band">
        <div className="container-narrow">
          <div className="page-header page-header-left">
            <span className="section-kicker">Support Center</span>
            <h1 className="page-title">{contact.pageTitle || 'Contact'}</h1>
            <p className="page-subtitle">{contact.pageSubtitle || 'Reach our support team.'}</p>
          </div>
        </div>
      </section>

      <section className="page-container">
        <div className="container-narrow">
          <div className="content-grid contact-grid-pro">
            <article className="content-card contact-card-pro">
              <h3>{contact.emailTitle || 'Email'}</h3>
              <p>{contact.emailAddress || 'support@payshield.com'}</p>
              <small>{contact.emailResponse || ''}</small>
              <a className="btn btn-secondary btn-small" href={`mailto:${contact.emailAddress || 'support@payshield.com'}`}>Send Email</a>
            </article>

            <article className="content-card contact-card-pro">
              <h3>{contact.phoneTitle || 'Phone'}</h3>
              <p>{contact.phoneNumber || '+91 90000 00000'}</p>
              <small>{contact.phoneHours || ''}</small>
              <a className="btn btn-secondary btn-small" href={`tel:${(contact.phoneNumber || '+919000000000').replace(/\s+/g, '')}`}>Call Support</a>
            </article>

            <article className="content-card contact-card-pro">
              <h3>{contact.liveChatTitle || 'Live Chat'}</h3>
              <p>{contact.liveChatAvailable || 'Available in app dashboard'}</p>
              <small>{contact.startChat || ''}</small>
              <a className="btn btn-secondary btn-small" href={`/${lang}/dashboard`}>Open Dashboard</a>
            </article>

            <article className="content-card contact-card-pro">
              <h3>{contact.officeTitle || 'Office'}</h3>
              <p>PayShield Operations Center</p>
              <small>Bengaluru, India</small>
              <span className="contact-pill">On-site Security Team</span>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
