import { Routes, Route } from 'react-router-dom';
import ModulePage from './ModulePage';
import ComplianceOverview from './ComplianceOverview';

const MODULE_CONFIG = {
  cipc: { name: 'CIPC', description: 'Companies & Intellectual Property Commission' },
  sars: { name: 'SARS Tax', description: 'South African Revenue Service' },
  labour: { name: 'Labour Law', description: 'Employment & Labour Compliance' },
  ohs: { name: 'OHS', description: 'Occupational Health & Safety' },
  popia: { name: 'POPIA & PAIA', description: 'Data Protection & Information Access' },
  bbbee: { name: 'B-BBEE', description: 'Broad-Based Black Economic Empowerment' },
  fica: { name: 'FICA', description: 'Financial Intelligence Centre Act' },
  municipal: { name: 'Municipal', description: 'Municipal Rates, Licenses & Permits' },
  industry: { name: 'Industry & Sector', description: 'Sector-Specific Requirements' },
  tax_engine: { name: 'Tax Engine', description: 'Tax Calculation & Optimization' },
};

export default function ComplianceRouter() {
  return (
    <Routes>
      <Route index element={<ComplianceOverview modules={MODULE_CONFIG} />} />
      {Object.entries(MODULE_CONFIG).map(([key, config]) => (
        <Route
          key={key}
          path={key}
          element={<ModulePage moduleId={key} moduleConfig={config} />}
        />
      ))}
    </Routes>
  );
}

export { MODULE_CONFIG };
