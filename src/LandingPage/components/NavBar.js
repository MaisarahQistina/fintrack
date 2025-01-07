import * as React from "react";

export function NavBar() {
  return (
    <div className="flex overflow-hidden flex-col justify-center px-6 w-full bg-sky-900 border-b border-solid border-b-stone-500 min-h-[72px] max-md:px-5 max-md:max-w-full">
      <div className="flex flex-wrap justify-between w-full max-md:max-w-full">
        <div className="flex gap-4 items-center my-auto text-white whitespace-nowrap min-w-[240px]">
          <div className="self-stretch my-auto text-4xl font-bold text-center">FINTRACK.</div>
          <div className="flex overflow-hidden gap-4 items-start self-stretch my-auto text-2xl">
            <div className="gap-2.5 p-2.5 border-b border-white">Home</div>
          </div>
        </div>
        <div className="flex flex-1 shrink gap-2 items-center h-full basis-0 min-w-[240px] max-md:max-w-full">
          <div className="flex gap-6 justify-center items-center self-stretch my-auto">
            <div className="flex gap-4 justify-center items-center self-stretch my-auto">
              <button className="flex relative gap-2 justify-center items-start self-stretch px-4 py-2.5 my-auto" tabIndex="0">
                <div className="flex absolute inset-0 z-0 gap-2.5 items-start self-start min-h-[40px] w-[83px]">
                  <div className="flex flex-1 shrink w-full rounded basis-0 min-h-[40px]" />
                </div>
                <div className="z-0 my-auto text-sm font-semibold leading-none text-center text-white">Sign In</div>
              </button>
              <button className="flex relative gap-2 justify-center items-start self-stretch px-4 py-2.5 my-auto" tabIndex="0">
                <div className="flex absolute inset-0 z-0 gap-2.5 items-start self-start min-h-[40px] w-[89px]">
                  <div className="flex flex-1 shrink w-full bg-cyan-100 rounded basis-0 min-h-[40px]" />
                </div>
                <div className="z-0 my-auto text-sm font-semibold leading-none text-center text-sky-900">Sign Up</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}