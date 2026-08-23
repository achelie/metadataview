export const SITE_BRAND = 'ViewExif';
export const SITE_CONTACT_EMAIL = 'contact@viewexif.com';
export const SITE_OPERATOR_MODEL = 'independent-individual';
export const POLICY_EFFECTIVE_DATE = '2026-08-23';
export const ADSENSE_PUBLISHER_ID = 'pub-7443237558968985';
export const ADSENSE_ACCOUNT_ID = 'ca-pub-7443237558968985';

export const SITE_IDENTITY = {
  brand: SITE_BRAND,
  contactEmail: SITE_CONTACT_EMAIL,
  operatorModel: SITE_OPERATOR_MODEL,
  policyEffectiveDate: POLICY_EFFECTIVE_DATE,
  adsensePublisherId: ADSENSE_PUBLISHER_ID,
  adsenseAccountId: ADSENSE_ACCOUNT_ID,
} as const;

export const siteIdentity = SITE_IDENTITY;
