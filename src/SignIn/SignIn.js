import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignInForm } from './components/SignInForm';
import { SignUpForm } from './components/SignUpForm';
import { AuthButton } from './components/AuthButton';

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  // Track whether we're on the sign-in page
  const [isSignIn, setIsSignIn] = useState(location.pathname === '/sign-in');

  useEffect(() => {
    setIsSignIn(location.pathname === '/sign-in');
  }, [location.pathname]);

  const handleFormToggle = (signInValue) => {
    setIsSignIn(signInValue);
    navigate(signInValue ? '/sign-in' : '/sign-up', { replace: true });
  };

  return (
    <div
      className="flex flex-col min-h-screen justify-center"
      style={{
        background: "url('/Background.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col items-center flex-grow px-16 pt-20 pb-7 max-md:px-5 max-md:py-24 justify-center">
        <div className="flex gap-5 w-full max-w-[1253px] items-center max-md:flex-col max-md:w-full">
          <div className="flex flex-col w-[42%] max-md:w-full pl-5">
            <div
              className={`flex gap-2.5 items-center self-center p-6 w-full bg-white rounded-3xl max-md:px-5 max-md:max-w-full transition-all duration-300 ${
                isSignIn ? "" : "-mt-[43px]"
              }`}
            >
              <div className="flex flex-col w-full">
                <div className="text-2xl text-center text-black max-md:max-w-full text-[24] font-abhaya">
                  <span>Welcome to </span>
                  <span className="font-bold">FinTrack</span>
                </div>
                <AuthButton isSignIn={isSignIn} setIsSignIn={handleFormToggle} />
                {/* Render appropriate form */}
                {isSignIn ? <SignInForm /> : <SignUpForm />}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-[58%] max-md:w-full"></div>
        </div>
      </div>
    </div>
  );
}
