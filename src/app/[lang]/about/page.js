import { getDictionary } from '@/i18n/getDictionary';

export default async function AboutPage(props) {
  const params = await props.params;
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);
  const about = dict.about || {};

  return (
    <div className="page-container">
      <div className="container-narrow">
        <div className="page-header">
          <h1 className="page-title">{about.pageTitle || 'About PayShield'}</h1>
          <p className="page-subtitle">{about.pageSubtitle || 'Secure payment operations for modern teams.'}</p>
        </div>

        <section className="content-card">
          <h2>{about.missionTitle || 'Mission'}</h2>
          <p>{about.missionText || ''}</p>
          <p>{about.missionContinued || ''}</p>
        </section>

        <section className="content-grid" style={{ marginTop: '1.5rem' }}>
          <article className="content-card">
            <h3>{about.securityTitle || 'Security'}</h3>
            <p>{about.securityList || ''}</p>
          </article>
          <article className="content-card">
            <h3>{about.aiTitle || 'Analytics'}</h3>
            <p>{about.aiList || ''}</p>
          </article>
          <article className="content-card">
            <h3>{about.realtimeSystemsTitle || 'Real-time Systems'}</h3>
            <p>{about.realtimeSystemsList || ''}</p>
          </article>
          <article className="content-card">
            <h3>{about.fingerprintingTitle || 'Device Controls'}</h3>
            <p>{about.fingerprintingList || ''}</p>
          </article>
        </section>
      </div>
    </div>
  );
}
