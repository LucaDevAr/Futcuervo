export const CLUBS = {
  futcuervo: {
    slug: "futcuervo",
    id: "68429af7587b60bfbe49342b",
    name: "FutCuervo",
    fanBase: "San Lorenzo",
    logo: "/images/futcuervo-logo.png",
    shield: "/images/san-lorenzo-escudo.png",
  },

  futmerengue: {
    slug: "futmerengue",
    id: "686a78a8607a6a666f53a675",
    name: "FutMerengue",
    fanBase: "Real Madrid",
    logo: "/images/futmerengue-logo.png",
    shield:
      "https://tmssl.akamaized.net/images/wappen/head/418.png?lm=1729684474",
  },

  futcule: {
    slug: "futcule",
    id: "68429af7587b60bfbe49342c",
    name: "FutCulé",
    fanBase: "Barcelona",
    logo: "/images/futcule-logo.png",
    shield:
      "https://tmssl.akamaized.net/images/wappen/head/131.png?lm=1406739548",
  },
};

export const CLUB_LIST = Object.values(CLUBS);

export function getClubBySlug(slug) {
  if (!slug) return null;
  return CLUBS[slug] ?? null;
}
