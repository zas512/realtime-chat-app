"use client";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3dCard";

const page = () => {
  return (
    <div className="h-full flex justify-center items-center">
      <CardContainer>
        <CardBody className="group/card hover:shadow-[0_0_15px_rgba(57,255,20,0.8)] bg-gray-800 backdrop-blur-sm shadow-lg bg-opacity-20 h-auto rounded-xl p-6 border space-y-4">
          <CardItem translateZ="50" className="text-xl font-bold">
            Welcome to the Chat App
          </CardItem>
          <CardItem translateZ="100" className="w-full">
            <input type="text" placeholder="Enter Username / Number / Email" autoComplete="new-username" className="w-full bg-black px-4 py-2 rounded-md" />
          </CardItem>
          <CardItem translateZ="100" className="w-full">
            <input type="password" placeholder="Enter Password" autoComplete="new-password" className="w-full bg-black px-4 py-2 rounded-md" />
          </CardItem>
          <div className="flex w-full justify-end">
            <CardItem translateZ={20} as="button" className="px-4 py-2 rounded-md bg-[#39FF14] text-sm font-bold hover:bg-[#37ff14c7]">
              Login
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
};
export default page;
