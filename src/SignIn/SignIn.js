import React from 'react';
import { NavBar } from '../LandingPage/components/NavBar.js';
import { SignInForm } from './components/SignInForm';

export function SignIn() {
  return (
    <div
      className="flex flex-col h-screen"
      style={{
        background: "url('/Sign In Page.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <NavBar />
      <div className="flex flex-col items-center flex-grow px-16 pt-28 pb-28 max-md:px-5 max-md:py-24">
        <div className="flex gap-5 w-full max-w-[1253px] max-md:flex-col max-md:w-full">
          <div className="flex flex-col w-[58%] max-md:w-full">
          </div>
          <div className="flex flex-col w-[42%] max-md:w-full">
            <div className="flex gap-2.5 items-center self-stretch p-6 my-auto w-full bg-white rounded-3xl max-md:px-5 max-md:mt-10 max-md:max-w-full">
              <SignInForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
