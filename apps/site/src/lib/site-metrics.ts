import { TRACES } from '@embedded32/demo';
import { listLabs, listPackages } from './content';

export function getSiteMetrics() {
  return {
    packageCount: listPackages().length,
    labCount: listLabs().length,
    scenarioCount: TRACES.length,
    hardwareRequired: 0,
  };
}
