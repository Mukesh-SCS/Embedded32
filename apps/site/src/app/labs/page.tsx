import type { Metadata } from 'next';
import Link from 'next/link';
import { DocsSidebar } from '@/components/SiteChrome';
import { listLabs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Classroom labs',
};

export default function LabsIndexPage() {
  const labs = listLabs();

  return (
    <div className="pageWithSidebar">
      <DocsSidebar activePath="/labs" />
      <div>
        <h1 className="pageTitle">Classroom labs</h1>
        <p className="lead">
          Four hardware-free labs for CAN, J1939, multi-ECU simulation, and diagnostics. Each
          includes starter code, solution, rubric, and instructor notes in the repository.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Lab</th>
              <th>Topic</th>
              <th>Repository path</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab) => (
              <tr key={lab.slug}>
                <td>
                  <Link href={`/labs/${lab.slug}`}>{lab.slug}</Link>
                </td>
                <td>{lab.title}</td>
                <td>
                  <code>labs/{lab.dirName}/</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '1.5rem' }}>
          Verify all solutions: <code>npm run test:labs</code> from the monorepo root.
        </p>
      </div>
    </div>
  );
}
