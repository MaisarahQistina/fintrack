import React from 'react';
import { useLocation } from 'react-router-dom';

export function AuthButton({ isSignIn, setIsSignIn }) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Use URL path to determine active state
  const isSignInActive = currentPath === '/sign-in';

  return (
    <div className="flex justify-between items-center p-2 mt-4 w-full text-xl bg-teal-100 rounded-lg max-md:max-w-full">
      <button
        className={`flex-1 shrink gap-2.5 p-2.5 self-stretch my-auto text-center ${isSignInActive ? 'text-white bg-sky-900' : 'text-sky-900'} basis-5 text-[20] font-abhaya rounded`}
        onClick={() => setIsSignIn(true)} 
      >
        Sign In
      </button>
      <button
        className={`flex-1 shrink self-stretch p-2.5 my-auto text-center ${!isSignInActive ? 'text-white bg-sky-900' : 'text-sky-900'} text-[20] font-abhaya rounded`}
        onClick={() => setIsSignIn(false)}
      >
        Sign Up
      </button>
    </div>
  );
}