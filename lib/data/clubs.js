const clubs = [
  {
    name: "San Lorenzo",
    slug: "san-lorenzo",
    logo: "/icons/san-lorenzo-logo.png",
    home: "/futcuervo",
  },
  {
    name: "Real Madrid",
    slug: "real-madrid",
    logo: "https://tmssl.akamaized.net//images/wappen/head/418.png?lm=1729684474",
    home: "/futmerengue",
  },
  {
    name: "FC Barcelona",
    slug: "barcelona",
    logo: "https://tmssl.akamaized.net//images/wappen/head/131.png?lm=1406739548",
    home: "/futcule",
  },
  {
    name: "Manchester United",
    slug: "manchester-united",
    logo: "https://tmssl.akamaized.net//images/wappen/head/985.png?lm=1457975903",
    home: "/futreddevils",
  },
  {
    name: "Liverpool FC",
    slug: "liverpool",
    logo: "https://tmssl.akamaized.net//images/wappen/head/31.png?lm=1727873452",
    home: "/futreds",
  },
  {
    name: "Paris Saint-Germain",
    slug: "psg",
    logo: "https://tmssl.akamaized.net//images/wappen/head/583.png?lm=1728026461",
    home: "/futpsg",
  },
  {
    name: "AFC Ajax",
    slug: "ajax",
    logo: "https://tmssl.akamaized.net//images/wappen/head/610.png?lm=1750408025",
    home: "/futajax",
  },
  {
    name: "FC Bayern München",
    slug: "bayern",
    logo: "https://tmssl.akamaized.net//images/wappen/head/27.png?lm=1729503608",
    home: "/futbayern",
  },
  {
    name: "Inter Milan",
    slug: "inter",
    logo: "https://tmssl.akamaized.net//images/wappen/head/46.png?lm=1618900989",
    home: "/futinter",
  },
  {
    name: "AC Milan",
    slug: "milan",
    logo: "https://tmssl.akamaized.net//images/wappen/head/5.png?lm=1605166627",
    home: "/futmilan",
  },
  {
    name: "Juventus FC",
    slug: "juventus",
    logo: "https://tmssl.akamaized.net//images/wappen/head/506.png?lm=1626441487",
    home: "/futjuve",
  },
];
export default clubs;

export function getAllClubs() {
  return clubs;
}

export function getClubById(id) {
  return clubs.find((club) => club.id === id);
}
