/**
 * Utility to generate canonical manufacturer website URLs for industrial catalog items.
 * Ensures clean, direct official website URLs (e.g. https://www.parker.com, https://www.gouldspumps.com)
 * across all brands and catalog jobs.
 */
export function buildCanonicalManufacturerUrl(brand: string, mpn?: string, productTitle?: string): string {
  const cleanBrand = brand ? brand.trim() : '';

  if (!cleanBrand || cleanBrand.toLowerCase().includes('generic') || cleanBrand.toLowerCase().includes('unbranded') || cleanBrand.toLowerCase().includes('pending')) {
    return 'https://www.unilogcorp.com';
  }

  const brandSlug = cleanBrand.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Master Brand Domain Mappings for Industrial Manufacturers
  const BRAND_DOMAINS: Record<string, string> = {
    'goulds': 'www.gouldspumps.com',
    'gouldspumps': 'www.gouldspumps.com',
    'gouldswatertechnology': 'www.goulds.com',
    'parker': 'www.parker.com',
    'parkerhannifin': 'www.parker.com',
    'squared': 'www.squared.com',
    'schneider': 'www.se.com',
    'schneiderelectric': 'www.se.com',
    'milwaukee': 'www.milwaukeetool.com',
    'milwaukeetool': 'www.milwaukeetool.com',
    'eaton': 'www.eaton.com',
    'cutlerhammer': 'www.eaton.com',
    '3m': 'www.3m.com',
    'senco': 'www.senco.com',
    'dewalt': 'www.dewalt.com',
    'bosch': 'www.boschtools.com',
    'boschtools': 'www.boschtools.com',
    'klein': 'www.kleintools.com',
    'kleintools': 'www.kleintools.com',
    'fluke': 'www.fluke.com',
    'ridgid': 'www.ridgid.com',
    'stanley': 'www.stanleytools.com',
    'craftsman': 'www.craftsman.com',
    'makita': 'www.makita.com',
    'baldor': 'www.baldor.com',
    'baldorreliance': 'www.baldor.com',
    'weg': 'www.weg.net',
    'nibco': 'www.nibco.com',
    'apollo': 'www.apollovalves.com',
    'conbraco': 'www.apollovalves.com',
    'kitchenaid': 'www.kitchenaid.com',
    'lg': 'www.lg.com',
    'speedqueen': 'www.speedqueen.com',
    'cafe': 'www.cafeappliances.com',
    'beko': 'www.beko.com',
    'frigidaire': 'www.frigidaire.com',
    'trex': 'www.trex.com',
    'timbertech': 'www.timbertech.com',
    'southwire': 'www.southwire.com',
    'carlon': 'www.carlon.com',
    'lutron': 'www.lutron.com',
    'leviton': 'www.leviton.com',
    'satco': 'www.satco.com',
    'kichler': 'www.kichler.com',
    'philips': 'www.lighting.philips.com',
    'firstalert': 'www.firstalert.com',
    'woodpeckers': 'www.woodpeck.com',
    'hager': 'www.hagerco.com',
    'nationalnail': 'www.nationalnail.com',
    'prebena': 'www.prebena.com',
    'diablo': 'www.diablotools.com',
    'mirka': 'www.mirka.com',
    'abranet': 'www.mirka.com',
    'emseal': 'www.emseal.com',
    'ge': 'www.geappliances.com',
    'geappliances': 'www.geappliances.com',
    'hunter': 'www.hunterfan.com',
    'edgeeyewear': 'www.edgeeyewear.com',
    'hiolit': 'www.mirka.com',
  };

  const domain = BRAND_DOMAINS[brandSlug] || `www.${brandSlug}.com`;
  return `https://${domain}`;
}

