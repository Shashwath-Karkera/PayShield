import { getDictionary } from '@/i18n/getDictionary';
import AppIcon from '@/components/AppIcon';
import Link from 'next/link';

const featureIconMap = {
  spiceLock: 'lock',
  mirrorMaze: 'shield',
  digitalPassport: 'globe',
  childhoodWhisper: 'scan',
  slowMotionTrap: 'timer',
  deviceDNA: 'dna',
  behaviorCamera: 'camera',
  alertSystem: 'alert'
};

export default async function FeaturesPage(props) {
  const params = await props.params;
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);
  const features = dict.features || {};

  const cards = Object.keys(featureIconMap).map((key) => ({
    key,
    title: features?.[key]?.title || key,
    subtitle: features?.[key]?.subtitle || '',
    icon: featureIconMap[key]
  }));

  return (
    <div className="page-shell page-features">
      <section className="page-hero-band">
        <div className="container">
          <div className="page-header page-header-left">
            <span className="section-kicker">Security Catalog</span>
            <h1 className="page-title">{features.pageTitle || 'Platform Capabilities'}</h1>
            <p className="page-subtitle">{features.pageSubtitle || 'Explore all payment security capabilities.'}</p>
          </div>
        </div>
      </section>

      <section className="page-container">
        <div className="container">
          <div className="feature-control-panel">
            <div>
              <h3>Layered Controls</h3>
              <p>Authentication, behavior analysis, and response orchestration in one workflow.</p>
            </div>
            <Link href={`/${lang}/register`} className="btn btn-primary">Start Securing Payments</Link>
          </div>

          <div className="features-grid features-grid-pro">
            {cards.map((card) => (
              <article key={card.key} className="feature-card feature-card-pro">
                <div className="feature-icon-shell">
                  <div className="feature-icon"><AppIcon name={card.icon} size={22} /></div>
                </div>
                <h3 className="feature-title">{card.title}</h3>
                <p className="feature-description">{card.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
