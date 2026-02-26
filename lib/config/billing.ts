export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  label: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', credits: 100, price: 9.9, label: 'Starter' },
  { id: 'growth', credits: 300, price: 24.9, label: 'Growth', popular: true },
  { id: 'scale', credits: 900, price: 59.9, label: 'Scale' }
];

export const PRO_PLAN = {
  id: 'pro',
  label: 'Pro',
  monthlyPrice: 9.9,
  monthlyCredits: 500
};

export function getCreditPackageById(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((item) => item.id === packageId);
}
