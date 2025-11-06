"use client";

import { useRouter } from "next/navigation";

const clubs = [
  {
    name: "San Lorenzo",
    slug: "san-lorenzo",
    logo: "/images/san-lorenzo-escudo.png",
    home: "/futcuervo",
  },
  // {
  //   name: "Real Madrid",
  //   slug: "real-madrid",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/418.png?lm=1729684474",
  //   home: "/futmerengue",
  // },
  // {
  //   name: "FC Barcelona",
  //   slug: "barcelona",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/131.png?lm=1406739548",
  //   home: "/futcule",
  // },
  // {
  //   name: "Manchester United",
  //   slug: "manchester-united",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/985.png?lm=1457975903",
  //   home: "/futreddevils",
  // },
  // {
  //   name: "Liverpool FC",
  //   slug: "liverpool",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/31.png?lm=1727873452",
  //   home: "/futreds",
  // },
  // {
  //   name: "Paris Saint-Germain",
  //   slug: "psg",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/583.png?lm=1728026461",
  //   home: "/futpsg",
  // },
  // {
  //   name: "AFC Ajax",
  //   slug: "ajax",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/610.png?lm=1750408025",
  //   home: "/futajax",
  // },
  // {
  //   name: "FC Bayern München",
  //   slug: "bayern",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/27.png?lm=1729503608",
  //   home: "/futbayern",
  // },
  // {
  //   name: "Inter Milan",
  //   slug: "inter",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/46.png?lm=1618900989",
  //   home: "/futinter",
  // },
  // {
  //   name: "AC Milan",
  //   slug: "milan",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/5.png?lm=1605166627",
  //   home: "/futmilan",
  // },
  // {
  //   name: "Juventus FC",
  //   slug: "juventus",
  //   logo: "https://tmssl.akamaized.net//images/wappen/head/506.png?lm=1626441487",
  //   home: "/futjuve",
  // },
];

export default function ClubSelector() {
  const router = useRouter();

  const handleClubClick = (club) => {
    router.push(club.home);
  };

  const isSingle = clubs.length === 1;

  return (
    <div className="w-full max-w-5xl mx-auto h-full flex items-center justify-center">
      {isSingle ? (
        // ✅ Vista optimizada cuando hay 1 solo club
        <div
          onClick={() => handleClubClick(clubs[0])}
          className="flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-xl p-6 bg-[var(--white)] shadow-md"
        >
          <div className="flex items-center justify-center w-40 h-40">
            <img
              src={clubs[0].logo || "/placeholder.svg"}
              alt={`Escudo ${clubs[0].name}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      ) : (
        // 🧱 Vista normal cuando hay varios clubes
        <div
          className="
            grid gap-4 sm:gap-3 lg:gap-4 justify-center auto-rows-fr
            grid-cols-[repeat(auto-fit,minmax(150px,1fr))]
          "
        >
          {clubs.map((club, index) => (
            <div
              key={index}
              onClick={() => handleClubClick(club)}
              className="flex flex-col items-center justify-center w-full aspect-square rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer shadow-md text-center bg-[var(--white)]"
            >
              <div className="flex items-center justify-center w-full h-28 sm:h-32 lg:h-36 p-2">
                <img
                  src={club.logo || "/placeholder.svg"}
                  alt={`Escudo ${club.name}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
