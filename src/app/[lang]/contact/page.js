import { getDictionary } from '@/i18n/getDictionary';

export default async function ContactPage(props) {
  const params = await props.params;
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);
  const contact = dict.contact || {};

  return (
    <div className="page-container">
      <div className="container-narrow">
        <div className="page-header">
          <h1 className="page-title">{contact.pageTitle || 'Contact'}</h1>
          <p className="page-subtitle">{contact.pageSubtitle || 'Reach our support team.'}</p>
        </div>

        <div className="content-grid">
          <article className="content-card">
            <h3>{contact.emailTitle || 'Email'}</h3>
            <p>{contact.emailAddress || 'support@payshield.com'}</p>
            <small>{contact.emailResponse || ''}</small>
          </article>

          <article className="content-card">
            <h3>{contact.phoneTitle || 'Phone'}</h3>
            <p>{contact.phoneNumber || ''}</p>
            <small>{contact.phoneHours || ''}</small>
          </article>

          <article className="content-card">
            <h3>{contact.liveChatTitle || 'Live Chat'}</h3>
            <p>{contact.liveChatAvailable || ''}</p>
            <small>{contact.startChat || ''}</small>
          </article>

          <article className="content-card">
            <h3>{contact.officeTitle || 'Office'}</h3>
            <p>PayShield Operations Center</p>
            <small>Bengaluru, India</small>
          </article>
        </div>
      </div>
    </div>
  );
}
