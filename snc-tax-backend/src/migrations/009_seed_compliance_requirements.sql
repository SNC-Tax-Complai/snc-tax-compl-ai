-- Migration 009: Seed Compliance Requirements
-- Date: 2026-05-17
-- South African SMME compliance requirements across all 10 modules

-- =============================================
-- MODULE: CIPC (Companies & Intellectual Property Commission)
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('Annual Return Filing', 'Annual return submission to CIPC confirming company details', 'CIPC-AR', 'cipc', 'Filing', 'Annual', ARRAY['pty_ltd','cc','npc'], 0, 2500),
('Company Name Reservation Renewal', 'Renewal of reserved company name if not yet registered', 'CIPC-NR', 'cipc', 'Registration', 'Once-off', ARRAY['pty_ltd','cc','npc'], 0, 0),
('Director Changes Notification', 'Notify CIPC within 28 days of director appointment or resignation', 'CIPC-CM14', 'cipc', 'Filing', 'Ad-hoc', ARRAY['pty_ltd','npc'], 0, 5000),
('Registered Address Change', 'Update CIPC within 28 days of office address change', 'CIPC-CM22', 'cipc', 'Filing', 'Ad-hoc', ARRAY['pty_ltd','cc','npc'], 0, 5000),
('MOI Amendment Filing', 'File amended Memorandum of Incorporation with CIPC', 'CIPC-MOI', 'cipc', 'Filing', 'Ad-hoc', ARRAY['pty_ltd','npc'], 0, 0),
('B-BBEE Certificate Upload', 'Upload valid B-BBEE certificate to CIPC portal', 'CIPC-BBBEE', 'cipc', 'Certificate', 'Annual', ARRAY['pty_ltd','cc'], 0, 0);

-- =============================================
-- MODULE: SARS (South African Revenue Service)
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('EMP201 Monthly Submission', 'Monthly employer reconciliation for PAYE, SDL and UIF', 'EMP201', 'sars', 'Filing', 'Monthly', ARRAY['pty_ltd','cc','sole_prop'], 1, 10000),
('EMP501 Biannual Reconciliation', 'Interim and final employer reconciliation submission', 'EMP501', 'sars', 'Filing', 'Biannual', ARRAY['pty_ltd','cc','sole_prop'], 1, 16000),
('ITR14 Annual Income Tax Return', 'Annual corporate income tax return', 'ITR14', 'sars', 'Filing', 'Annual', ARRAY['pty_ltd','cc'], 0, 16000),
('VAT201 Return', 'VAT return for registered vendors', 'VAT201', 'sars', 'Filing', 'Bimonthly', ARRAY['pty_ltd','cc','sole_prop'], 0, 5000),
('Provisional Tax (IRP6)', 'Provisional tax payments - first and second period', 'IRP6', 'sars', 'Filing', 'Biannual', ARRAY['pty_ltd','cc','sole_prop'], 0, 10000),
('Tax Clearance Certificate Renewal', 'Valid tax compliance status (TCS) for tenders and licensing', 'TCS', 'sars', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 0),
('Dividends Tax Return (DTR)', 'Declaration and payment of dividends tax (20%)', 'DTR02', 'sars', 'Filing', 'Ad-hoc', ARRAY['pty_ltd'], 0, 10000),
('PAYE Registration', 'Register as employer for PAYE when first employee hired', 'PAYE-REG', 'sars', 'Registration', 'Once-off', ARRAY['pty_ltd','cc','sole_prop'], 1, 0),
('UIF Registration', 'Unemployment Insurance Fund employer registration', 'UIF-REG', 'sars', 'Registration', 'Once-off', ARRAY['pty_ltd','cc','sole_prop'], 1, 0),
('SDL Registration', 'Skills Development Levy registration (payroll > R500k)', 'SDL-REG', 'sars', 'Registration', 'Once-off', ARRAY['pty_ltd','cc'], 0, 0);

-- =============================================
-- MODULE: Labour Law
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('COIDA Return of Earnings', 'Annual return of earnings to Compensation Fund', 'COIDA-ROE', 'labour', 'Filing', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 1, 10000),
('COIDA Registration', 'Register with Compensation Fund for workplace injuries', 'COIDA-REG', 'labour', 'Registration', 'Once-off', ARRAY['pty_ltd','cc','sole_prop'], 1, 0),
('UIF Monthly Contributions', 'Monthly UIF contributions for all employees', 'UIF-MONTHLY', 'labour', 'Filing', 'Monthly', ARRAY['pty_ltd','cc','sole_prop'], 1, 5000),
('Employment Equity Report (EEA2)', 'Annual employment equity report for designated employers', 'EEA2', 'labour', 'Filing', 'Annual', ARRAY['pty_ltd','cc'], 50, 50000),
('Employment Equity Plan (EEA13)', 'Submit employment equity plan every 3-5 years', 'EEA13', 'labour', 'Filing', 'Once-off', ARRAY['pty_ltd','cc'], 50, 50000),
('Workplace Skills Plan (WSP)', 'Annual workplace skills plan submission to SETA', 'WSP', 'labour', 'Filing', 'Annual', ARRAY['pty_ltd','cc'], 0, 0),
('Employment Contracts', 'Written employment contracts for all employees (BCEA)', 'BCEA-CONTRACT', 'labour', 'Certificate', 'Ad-hoc', ARRAY['pty_ltd','cc','sole_prop'], 1, 0),
('Minimum Wage Compliance', 'Ensure all employees paid at or above National Minimum Wage', 'NMW', 'labour', 'Reporting', 'Monthly', ARRAY['pty_ltd','cc','sole_prop'], 1, 25000),
('Bargaining Council Registration', 'Register with applicable bargaining council if in covered sector', 'BC-REG', 'labour', 'Registration', 'Once-off', ARRAY['pty_ltd','cc'], 1, 10000);

-- =============================================
-- MODULE: OHS (Occupational Health & Safety)
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('Health & Safety Policy', 'Written H&S policy displayed in workplace (OHS Act Sec 7)', 'OHS-POLICY', 'ohs', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 1, 0),
('Safety Representative Appointment', 'Appoint safety representatives (20+ employees per shift)', 'OHS-SAFETYREP', 'ohs', 'Registration', 'Once-off', ARRAY['pty_ltd','cc'], 20, 0),
('Health & Safety Committee', 'Establish H&S committee if 2+ safety reps required', 'OHS-COMMITTEE', 'ohs', 'Registration', 'Once-off', ARRAY['pty_ltd','cc'], 40, 0),
('Incident Reporting (WCL2)', 'Report workplace injuries to Compensation Commissioner', 'OHS-WCL2', 'ohs', 'Filing', 'Ad-hoc', ARRAY['pty_ltd','cc','sole_prop'], 1, 10000),
('Risk Assessment', 'Conduct and document workplace risk assessments', 'OHS-RISK', 'ohs', 'Reporting', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 1, 0),
('First Aid Compliance', 'Maintain first aid equipment and trained first aiders', 'OHS-FIRSTAID', 'ohs', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 1, 0),
('Fire Certificate', 'Valid fire certificate from local municipality', 'OHS-FIRE', 'ohs', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 5000);

-- =============================================
-- MODULE: POPIA & PAIA
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('Information Officer Registration', 'Register Information Officer with Information Regulator', 'POPIA-IO', 'popia', 'Registration', 'Once-off', ARRAY['pty_ltd','cc','npc'], 0, 10000000),
('PAIA Manual (Section 51)', 'Publish and maintain Section 51 PAIA manual', 'PAIA-S51', 'popia', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop','npc'], 0, 2000000),
('Privacy Policy Publication', 'Publish privacy policy accessible to data subjects', 'POPIA-PRIVACY', 'popia', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop','npc'], 0, 0),
('Data Processing Agreement', 'Agreements with all third-party data processors', 'POPIA-DPA', 'popia', 'Certificate', 'Ad-hoc', ARRAY['pty_ltd','cc','npc'], 0, 10000000),
('Data Breach Response Plan', 'Documented data breach incident response procedure', 'POPIA-BREACH', 'popia', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','npc'], 0, 10000000),
('Consent Management', 'Maintain records of data subject consent', 'POPIA-CONSENT', 'popia', 'Reporting', 'Ad-hoc', ARRAY['pty_ltd','cc','sole_prop','npc'], 0, 0),
('Data Retention Policy', 'Document and implement data retention and destruction policy', 'POPIA-RETENTION', 'popia', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','npc'], 0, 0);

-- =============================================
-- MODULE: B-BBEE
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('B-BBEE Verification (EME)', 'Exempted Micro Enterprise affidavit (turnover < R10m)', 'BBBEE-EME', 'bbbee', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 0),
('B-BBEE Verification (QSE)', 'Qualifying Small Enterprise scorecard (R10m - R50m)', 'BBBEE-QSE', 'bbbee', 'Certificate', 'Annual', ARRAY['pty_ltd','cc'], 0, 0),
('B-BBEE Verification (Generic)', 'Generic enterprise full scorecard (turnover > R50m)', 'BBBEE-GEN', 'bbbee', 'Certificate', 'Annual', ARRAY['pty_ltd'], 0, 0),
('Skills Development Spending', 'Minimum skills development expenditure (6% of payroll)', 'BBBEE-SKILLS', 'bbbee', 'Reporting', 'Annual', ARRAY['pty_ltd','cc'], 0, 0),
('Enterprise Development Contribution', 'Contributions to qualifying enterprise development beneficiaries', 'BBBEE-ED', 'bbbee', 'Reporting', 'Annual', ARRAY['pty_ltd','cc'], 0, 0),
('Socio-Economic Development', 'SED contribution (1% of NPAT)', 'BBBEE-SED', 'bbbee', 'Reporting', 'Annual', ARRAY['pty_ltd'], 0, 0);

-- =============================================
-- MODULE: FICA (Financial Intelligence Centre Act)
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('FICA Registration (Accountable Institution)', 'Register with FIC as accountable/reporting institution', 'FICA-REG', 'fica', 'Registration', 'Once-off', ARRAY['pty_ltd','cc'], 0, 5000000),
('Risk Management & Compliance Programme', 'Documented RMCP as per FIC requirements', 'FICA-RMCP', 'fica', 'Certificate', 'Annual', ARRAY['pty_ltd','cc'], 0, 5000000),
('Customer Due Diligence (KYC)', 'Maintain KYC records for all clients per FICA Sec 21', 'FICA-CDD', 'fica', 'Reporting', 'Ad-hoc', ARRAY['pty_ltd','cc'], 0, 5000000),
('Suspicious Transaction Reports', 'File STRs with FIC within prescribed timeframes', 'FICA-STR', 'fica', 'Filing', 'Ad-hoc', ARRAY['pty_ltd','cc'], 0, 5000000),
('Cash Threshold Reports', 'Report cash transactions over R24,999 to FIC', 'FICA-CTR', 'fica', 'Filing', 'Ad-hoc', ARRAY['pty_ltd','cc','sole_prop'], 0, 1000000),
('FICA Training', 'Annual FICA compliance training for relevant staff', 'FICA-TRAIN', 'fica', 'Certificate', 'Annual', ARRAY['pty_ltd','cc'], 0, 0);

-- =============================================
-- MODULE: Municipal
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('Business License/Permit', 'Valid municipal business operating license', 'MUN-LICENSE', 'municipal', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 10000),
('Rates and Taxes', 'Municipal property rates payment (if property owner)', 'MUN-RATES', 'municipal', 'Filing', 'Monthly', ARRAY['pty_ltd','cc','sole_prop'], 0, 0),
('Liquor License Renewal', 'Annual liquor license renewal (if applicable)', 'MUN-LIQUOR', 'municipal', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 25000),
('Zoning Compliance', 'Ensure premises zoned for commercial/industrial use', 'MUN-ZONING', 'municipal', 'Certificate', 'Once-off', ARRAY['pty_ltd','cc','sole_prop'], 0, 0),
('Health Certificate', 'Certificate of acceptability for food premises', 'MUN-HEALTH', 'municipal', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 5000),
('Advertising Signs Permit', 'Municipal permit for business signage', 'MUN-SIGNS', 'municipal', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 2000),
('Waste Removal Registration', 'Register for municipal waste collection services', 'MUN-WASTE', 'municipal', 'Registration', 'Once-off', ARRAY['pty_ltd','cc','sole_prop'], 0, 0);

-- =============================================
-- MODULE: Industry & Sector Specific
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, applicable_sectors, min_employees, penalty_amount) VALUES
('FSCA Registration', 'Financial Sector Conduct Authority license for financial services', 'IND-FSCA', 'industry', 'Registration', 'Once-off', ARRAY['pty_ltd','cc'], ARRAY['financial_services'], 0, 100000),
('CIDB Registration', 'Construction Industry Development Board registration', 'IND-CIDB', 'industry', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], ARRAY['construction'], 0, 50000),
('NHBRC Registration', 'National Home Builders Registration Council enrollment', 'IND-NHBRC', 'industry', 'Registration', 'Once-off', ARRAY['pty_ltd','cc','sole_prop'], ARRAY['construction'], 0, 25000),
('Tourism BEE Sector Code', 'Tourism sector-specific B-BBEE scorecard', 'IND-TOURISM', 'industry', 'Certificate', 'Annual', ARRAY['pty_ltd','cc'], ARRAY['tourism','hospitality'], 0, 0),
('HPCSA Registration', 'Health Professions Council registration for practitioners', 'IND-HPCSA', 'industry', 'Registration', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], ARRAY['healthcare'], 0, 50000),
('Estate Agency Affairs Board', 'EAAB fidelity fund certificate for property practitioners', 'IND-EAAB', 'industry', 'Certificate', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], ARRAY['real_estate'], 0, 25000);

-- =============================================
-- MODULE: Tax Engine (Calculation & Optimization)
-- =============================================
INSERT INTO compliance_requirements (name, description, regulation_code, module, compliance_type, frequency, applicable_company_types, min_employees, penalty_amount) VALUES
('Corporate Tax Rate Assessment', 'Annual assessment of applicable corporate tax rate (27%)', 'TAX-RATE', 'tax_engine', 'Reporting', 'Annual', ARRAY['pty_ltd','cc'], 0, 0),
('Small Business Corporation Election', 'Elect SBC status for reduced tax rates (turnover < R20m)', 'TAX-SBC', 'tax_engine', 'Filing', 'Annual', ARRAY['pty_ltd','cc'], 0, 0),
('Turnover Tax Registration', 'Micro business turnover tax election (turnover < R1m)', 'TAX-TURNOVER', 'tax_engine', 'Registration', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 0),
('Tax Deduction Optimization', 'Review and optimize allowable tax deductions annually', 'TAX-DEDUCT', 'tax_engine', 'Reporting', 'Annual', ARRAY['pty_ltd','cc','sole_prop'], 0, 0),
('Capital Gains Tax Planning', 'Annual CGT exposure assessment and planning', 'TAX-CGT', 'tax_engine', 'Reporting', 'Annual', ARRAY['pty_ltd','cc'], 0, 0),
('Transfer Pricing Documentation', 'Transfer pricing documentation for connected persons', 'TAX-TP', 'tax_engine', 'Reporting', 'Annual', ARRAY['pty_ltd'], 0, 0);
