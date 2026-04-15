import { getDictionary } from '@/i18n/getDictionary';
import AppIcon from '@/components/AppIcon';

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
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{features.pageTitle || 'Platform Capabilities'}</h1>
          <p className="page-subtitle">{features.pageSubtitle || 'Explore all payment security capabilities.'}</p>
        </div>

        <div className="features-grid">
          {cards.map((card) => (
            <article key={card.key} className="feature-card">
              <div className="feature-icon"><AppIcon name={card.icon} size={22} /></div>
              <h3>{card.title}</h3>
              <p>{card.subtitle}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
