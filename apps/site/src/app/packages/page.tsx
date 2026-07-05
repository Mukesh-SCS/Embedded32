import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DocsSidebar } from '@/components/SiteChrome';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { Badge } from '@/components/ui/Badge';
import { CodePanel } from '@/components/ui/CodePanel';
import { listPackages } from '@/lib/content';
import { getPackageCard } from '@/lib/packages-info';
import styles from './packages.module.css';

export const metadata: Metadata = {
  title: 'Packages',
  description: 'Choose an @embedded32 package for CAN, J1939, simulation, and bridging.',
};

export default function PackagesIndexPage() {
  const packages = listPackages();

  return (
    <div className="pageWithSidebar">
      <DocsSidebar activePath="/packages" />
      <div>
        <Breadcrumbs items={[{ label: 'Packages' }]} />
        <h1 className="pageTitle" data-testid="packages-index-title">
          @embedded32 packages
        </h1>
        <p className="lead">
          Ten public npm packages are maintained in this monorepo at version <code>1.0.0</code>. Source is available
          via GitHub and local workspace install. Publishing to the public npm registry requires maintainer approval —
          see the <Link href="/docs/package-guide">package selection guide</Link>.
        </p>

        <div className={styles.cardGrid}>
          {packages.map((pkg) => {
            const card = getPackageCard(pkg.slug);
            return (
              <BrutalCard key={pkg.slug} className={styles.pkgCard}>
                <h2>
                  <Link href={`/packages/${pkg.slug}`} data-testid={`pkg-card-${pkg.slug}`}>
                    {pkg.name}
                  </Link>
                </h2>
                <p>{card?.problem ?? pkg.description}</p>
                <div className={styles.badges}>
                  <Badge>{card?.runtime ?? 'Node.js'}</Badge>
                  {card?.hardwareFree && <Badge variant="green">Hardware-free</Badge>}
                  <Badge variant={card?.level === 'advanced' ? 'warning' : 'cyan'}>
                    {card?.level ?? 'beginner'}
                  </Badge>
                </div>
                {card?.related && (
                  <p className={styles.related}>
                    Related: <Link href={`/packages/${card.related}`}>@embedded32/{card.related}</Link>
                  </p>
                )}
                {card?.install && <CodePanel language="install" code={card.install} />}
              </BrutalCard>
            );
          })}
        </div>

        <h2 className={styles.compareTitle}>Comparison</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Package</th>
              <th>Runtime</th>
              <th>Level</th>
              <th>Hardware-free</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => {
              const card = getPackageCard(pkg.slug);
              return (
                <tr key={pkg.slug}>
                  <td>
                    <Link href={`/packages/${pkg.slug}`}>{pkg.name}</Link>
                  </td>
                  <td>{card?.runtime ?? 'Node.js'}</td>
                  <td>{card?.level ?? 'beginner'}</td>
                  <td>{card?.hardwareFree ? 'Yes' : 'Partial'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className={styles.private}>
          Private packages in this monorepo: <code>@embedded32/dashboard</code>, <code>@embedded32/sdk-c</code>,{' '}
          <code>@embedded32/sdk-python</code>.
        </p>
      </div>
    </div>
  );
}
