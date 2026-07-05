import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DocsSidebar } from '@/components/SiteChrome';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { Badge } from '@/components/ui/Badge';
import { labHref, listLabs } from '@/lib/content';
import { LAB_CARDS } from '@/lib/labs-meta';
import styles from './labs.module.css';

export const metadata: Metadata = {
  title: 'Classroom labs',
  description: 'Hardware-free CAN and J1939 classroom labs with rubrics and verified solutions.',
};

export default function LabsIndexPage() {
  const labs = listLabs();

  return (
    <div className="pageWithSidebar">
      <DocsSidebar activePath="/labs" />
      <div>
        <Breadcrumbs items={[{ label: 'Labs' }]} />
        <h1 className="pageTitle" data-testid="labs-index-title">
          Classroom labs
        </h1>
        <p className="lead">
          Four hardware-free labs for CAN, J1939, multi-ECU simulation, and diagnostics. Starter code, solutions,
          rubrics, and instructor notes live in the repository.
        </p>

        <div className={styles.labGrid}>
          {labs.map((lab) => {
            const card = LAB_CARDS[lab.slug];
            return (
              <BrutalCard key={lab.slug} variant="yellow" className={styles.labCard}>
                <div className={styles.labHeader}>
                  <span className={styles.labNumber}>LAB {card?.number ?? '??'}</span>
                  <Badge variant="green">{card?.hardware ?? 'NO HARDWARE'}</Badge>
                </div>
                <h2>{card?.shortTitle ?? lab.title}</h2>
                <p className={styles.meta}>
                  {card?.duration} · {card?.difficulty ?? 'beginner'}
                </p>
                <p>{card?.objective ?? lab.title}</p>
                {card?.prerequisites && (
                  <p className={styles.prereq}>
                    <strong>Prerequisites:</strong> {card.prerequisites.join('; ')}
                  </p>
                )}
                <Link href={labHref(lab.slug)} className={styles.startLink} data-testid={`lab-card-${lab.slug}`}>
                  Start lab →
                </Link>
              </BrutalCard>
            );
          })}
        </div>

        <p className={styles.verify}>
          Verify all solutions: <code>npm run test:labs</code> from the monorepo root.
        </p>
      </div>
    </div>
  );
}
