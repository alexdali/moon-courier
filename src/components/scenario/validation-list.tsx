'use client';

import type { ScenarioValidationReport } from '@/domain/scenarios/scenario-validator';
import { Icon } from '@/components/common/icon';
import { useI18n } from '@/i18n/i18n-provider';

export function ValidationList({ report }: { report: ScenarioValidationReport }) {
  const { t } = useI18n();
  return <div className="validation-list">{report.checks.map((check) => <div key={check.code} className={`validation-item validation-item--${check.status}`}><span><Icon name={check.status === 'pass' ? 'check' : 'alert'} size={15}/></span><div><strong>{t(check.code.replaceAll('_', ' '))}</strong><small>{t(check.message)}</small></div></div>)}</div>;
}
