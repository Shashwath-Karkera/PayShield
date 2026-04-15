import { getDictionary } from '@/i18n/getDictionary';

export default async function AboutPage(props) {
  const params = await props.params;
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);
  const about = dict.about || {};

  return (
    <div className="page-shell page-about">
      <section className="page-hero-band">
        <div className="container-narrow">
          <div className="page-header page-header-left">
            <span className="section-kicker">About The Platform</span>
            <h1 className="page-title">{about.pageTitle || 'About PayShield'}</h1>
            <p className="page-subtitle">{about.pageSubtitle || 'Secure payment operations for modern teams.'}</p>
          </div>
        </div>
      </section>

      <section className="page-container">
        <div className="container-narrow">
          <section className="content-card mission-card">
            <h2>{about.missionTitle || 'Mission'}</h2>
            <p>{about.missionText || ''}</p>
            <p>{about.missionContinued || ''}</p>
          </section>

          <section className="content-grid content-grid-xl">
            <article className="content-card content-card-elevated">
              <h3>{about.securityTitle || 'Security'}</h3>
              <p>{about.securityList || ''}</p>
            </article>
            <article className="content-card content-card-elevated">
              <h3>{about.aiTitle || 'Analytics'}</h3>
              <p>{about.aiList || ''}</p>
            </article>
            <article className="content-card content-card-elevated">
              <h3>{about.realtimeSystemsTitle || 'Real-time Systems'}</h3>
              <p>{about.realtimeSystemsList || ''}</p>
            </article>
            <article className="content-card content-card-elevated">
              <h3>{about.fingerprintingTitle || 'Device Controls'}</h3>
              <p>{about.fingerprintingList || ''}</p>
            </article>
          </section>
        </div>
      </section>
    </div>
  );
}
