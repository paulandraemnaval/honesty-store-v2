import * as React from "react";

import icons from "@/constants/icons";
import Image from "next/image";
import AuthForm from "@/components/auth-form";
export function Page() {
  return (
    <div className="flex w-full h-full font-inter">
      <div className="flex-1 flex-col  w-full h-full p-4 bg-gradient-to-b from-[#00D4FF] to-[#001BFF] flex">
        <div className="flex w-fit p-2 rounded-md gap-4 items-center ">
          <Image
            src={icons.logo}
            alt="logo"
            width={40}
            height={40}
            className="bg-[#0175fb] rounded-sm object-cover"
          />

          <span className="font-semibold text-2xl text-white">
            Honesty Store IMS
          </span>
        </div>
        <span className="font-bold text-3xl text-white mt-auto flex  w-full justify-center items-center p-4">
          Your one stop solution for inventory management.
        </span>
      </div>
      <div className="flex-1 flex-col items-center justify-center w-full h-full p-4 bg-white flex">
        <AuthForm />
      </div>
    </div>
  );
}

export default Page;
