import type { Metadata } from 'next';
import Link from 'next/link';
import { DocsSidebar } from '@/components/SiteChrome';
import { listPackages } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Packages',
};

export default function PackagesIndexPage() {
  const packages = listPackages();

  return (
    <div className="pageWithSidebar">
      <DocsSidebar activePath="/packages" />
      <div>
        <h1 className="pageTitle">@embedded32 packages</h1>
        <p className="lead">
          Ten public npm packages at version <code>1.0.0</code> in this monorepo. Publishing
          requires maintainer approval - see the{' '}
          <Link href="/docs/package-guide">package selection guide</Link>.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.slug}>
                <td>
                  <Link href={`/packages/${pkg.slug}`}>{pkg.name}</Link>
                </td>
                <td>{pkg.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '1.5rem' }}>
          Private packages: <code>@embedded32/dashboard</code>, <code>@embedded32/sdk-c</code>,{' '}
          <code>@embedded32/sdk-python</code>.
        </p>
      </div>
    </div>
  );
}
