"use client";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  return (
    <main>
      <div className="mb-5 text-2xl font-bold">About</div>

      <div
        className={twMerge(
          "mx-auto mb-5 w-full md:w-2/3",
          "flex justify-center",
        )}
      >
        <Image
          src="/images/avatar.png"
          alt="Example Image"
          width={350}
          height={350}
          priority
          className="rounded-full border-4 border-slate-500 p-1.5"
        />
      </div>
      <div className={twMerge("mx-auto mb-5 flex justify-center md:w-2/3")}>
        <Image
          src="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortCurly&accessoriesType=Round&hairColor=Black&facialHairType=MoustacheFancy&facialHairColor=Platinum&clotheType=CollarSweater&clotheColor=PastelBlue&graphicType=Diamond&eyeType=EyeRoll&eyebrowType=UpDown&mouthType=Grimace&skinColor=DarkBrown"
          alt="Remote Image"
          width={350}
          height={350}
          unoptimized
        />
      </div>
    </main>
  );
};

export default Page;
