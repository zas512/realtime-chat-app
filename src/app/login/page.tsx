"use client";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3dCard";
import Button from "@/components/ui/Button";
import { useState, memo, ReactElement } from "react";
import { Loader2 } from "lucide-react";
import { FaGoogle, FaFacebookF, FaRedditAlien } from "react-icons/fa";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

interface SocialLoginButtonProps {
  Icon: ReactElement;
  hoverColor: string;
  onClick?: () => void;
  loading: boolean;
  disabled: boolean;
}

const Page = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const loginWithGoogle = async () => {
    setLoading("google");
    try {
      await signIn("google");
    } catch (error) {
      toast.error("Something went wrong!");
      console.log('---->',error);
      
    } finally {
      setLoading(null);
    }
  };

  const loginWithFacebook = async () => {
    setLoading("facebook");
    try {
      // Add your login logic here
    } finally {
      setLoading(null);
    }
  };

  const loginWithReddit = async () => {
    setLoading("reddit");
    try {
    } finally {
    }
  };

  const SocialLoginButton = memo(({ Icon, hoverColor, onClick, loading, disabled }: SocialLoginButtonProps) => (
    <button
      className={`size-10 transition-all duration-300 bg-gray-500 focus:outline-none border border-gray-600 rounded-full ${
        disabled ? "bg-opacity-50 cursor-not-allowed text-opacity-50" : "hover:bg-transparent hover:border-white hover:shadow-[0_0_5px_rgba(57,255,20,0.5)]"
      } flex justify-center items-center ${disabled ? "" : hoverColor} `}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? <Loader2 className="size-6 animate-spin" /> : Icon}
    </button>
  ));
  SocialLoginButton.displayName = "SocialLoginButton";

  return (
    <div className="h-full flex justify-center items-center">
      <CardContainer>
        <CardBody className="group/card hover:shadow-[0_0_15px_rgba(57,255,20,0.8)] bg-gray-800 backdrop-blur-sm shadow-lg bg-opacity-20 h-auto rounded-xl p-6 border border-gray-400 hover:border-white space-y-6 hover:border-2">
          <CardItem translateZ="50" className="text-xl font-bold">
            Welcome to the Chat App
          </CardItem>
          <CardItem translateZ="100" className="w-full">
            <input
              type="text"
              placeholder="Enter Username / Number / Email"
              autoComplete="new-username"
              className="w-full bg-black px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-gray-200"
            />
          </CardItem>
          <CardItem translateZ="100" className="w-full">
            <input
              type="password"
              placeholder="Enter Password"
              autoComplete="new-password"
              className="w-full bg-black px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-gray-200"
            />
          </CardItem>
          <CardItem translateZ={20} className="w-full">
            <Button type="button" className="w-full bg-gray-500 hover:bg-gray-600 hover:shadow-[0_0_5px_rgba(57,255,20,0.5)] focus:outline-none border border-gray-600 hover:border-white" disabled>
              Login
            </Button>
          </CardItem>
          <CardItem translateZ="100">
            <div>
              <p className="text-sm mb-2">Or Sign in using...</p>
              <section className="w-full flex gap-4 h-12">
                <SocialLoginButton Icon={<FaGoogle size="20" />} hoverColor="hover:text-yellow-500" onClick={loginWithGoogle} loading={loading === "google"} disabled={false} />
                <SocialLoginButton Icon={<FaFacebookF size="20" />} hoverColor="hover:text-blue-500" onClick={loginWithFacebook} loading={loading === "facebook"} disabled={true} />
                <SocialLoginButton Icon={<FaRedditAlien size="20" />} hoverColor="hover:text-orange-500" onClick={loginWithReddit} loading={loading === "reddit"} disabled={true} />
              </section>
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </div>
  );
};

Page.displayName = "Page";

export default Page;
