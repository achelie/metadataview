import { recommendations } from './recommendations';
import { makeRisk, riskFields } from './risk-utils';
import type { PrivacyCombinationRule, PrivacyRisk } from './types';

function has(risks: readonly PrivacyRisk[], ids: readonly string[]): boolean { return risks.some((risk) => ids.includes(risk.id)); }
function fields(risks: readonly PrivacyRisk[], ids: readonly string[]) { return riskFields(risks, ids); }

export const privacyCombinationRules: PrivacyCombinationRule[] = [
  {
    id: 'location-time-combination',
    evaluate(_context, risks) {
      const ids = ['precise-location', 'capture-time'];
      if (!ids.every((id) => has(risks, [id]))) return null;
      return makeRisk({ id: this.id, category: 'location', title: 'Location plus capture time', severity: 'high', score: 10, fields: fields(risks, ids), description: 'Location and capture time together can reveal where and when the image was taken.', recommendation: recommendations.location, combination: true });
    },
  },
  {
    id: 'location-device-combination',
    evaluate(_context, risks) {
      if (!has(risks, ['precise-location']) || !has(risks, ['device-model', 'device-identifier'])) return null;
      const ids = ['precise-location', 'device-model', 'device-identifier'];
      return makeRisk({ id: this.id, category: 'device', title: 'Location plus device information', severity: 'medium', score: 5, fields: fields(risks, ids), description: 'Location and device details together make cross-file correlation easier.', recommendation: recommendations.device, combination: true });
    },
  },
  {
    id: 'identity-contact-combination',
    evaluate(_context, risks) {
      const ids = ['creator-identity', 'device-owner', 'contact-details'];
      if (!has(risks, ['creator-identity', 'device-owner']) || !has(risks, ['contact-details'])) return null;
      return makeRisk({ id: this.id, category: 'identity', title: 'Name plus contact details', severity: 'high', score: 10, fields: fields(risks, ids), description: 'A personal name paired with contact details creates a direct identity link.', recommendation: recommendations.identity, combination: true });
    },
  },
  {
    id: 'model-serial-combination',
    evaluate(_context, risks) {
      const ids = ['device-model', 'device-identifier'];
      if (!ids.every((id) => has(risks, [id]))) return null;
      return makeRisk({ id: this.id, category: 'device', title: 'Camera model plus serial number', severity: 'medium', score: 5, fields: fields(risks, ids), description: 'A model paired with a serial number forms a stronger device fingerprint than either field alone.', recommendation: recommendations.device, combination: true });
    },
  },
  {
    id: 'workflow-path-combination',
    evaluate(_context, risks) {
      const ids = ['comfy-workflow', 'local-file-path'];
      if (!ids.every((id) => has(risks, [id]))) return null;
      return makeRisk({ id: this.id, category: 'ai-generation', title: 'Workflow plus local file path', severity: 'critical', score: 10, fields: fields(risks, ids), description: 'The workflow preserves both a production graph and local paths that may expose usernames or project structure.', recommendation: recommendations.workflow, combination: true });
    },
  },
  {
    id: 'location-identity-time-combination',
    evaluate(_context, risks) {
      if (!has(risks, ['precise-location']) || !has(risks, ['creator-identity', 'device-owner']) || !has(risks, ['capture-time'])) return null;
      const ids = ['precise-location', 'creator-identity', 'device-owner', 'capture-time'];
      return makeRisk({ id: this.id, category: 'location', title: 'Location, identity, and time correlation', severity: 'critical', score: 10, fields: fields(risks, ids), description: 'A name, exact place, and capture time together form a highly identifying event record.', recommendation: recommendations.location, combination: true });
    },
  },
];

export function combinationRisks(context: Parameters<PrivacyCombinationRule['evaluate']>[0], baseRisks: readonly PrivacyRisk[], warnings: string[] = []): PrivacyRisk[] {
  const output: PrivacyRisk[] = [];
  for (const rule of privacyCombinationRules) {
    try { const risk = rule.evaluate(context, baseRisks); if (risk) output.push(risk); }
    catch { warnings.push(`Combination rule ${rule.id} could not be evaluated.`); }
  }
  return output;
}
