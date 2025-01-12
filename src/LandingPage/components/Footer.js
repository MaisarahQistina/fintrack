import * as React from "react";

export function Footer() {
  return (
    <div className="flex overflow-hidden flex-col justify-center px-6 py-20 w-full bg-sky-900 max-md:px-5 max-md:max-w-full">
      <div className="flex flex-col w-full max-md:max-w-full">
        <div className="flex flex-wrap w-full max-md:max-w-full">
          <div className="overflow-hidden flex-1 shrink self-start text-4xl font-bold text-center text-white whitespace-nowrap min-w-[240px] max-md:max-w-full font-abhaya">
            FINTRACK.
          </div>
          <div className="flex overflow-hidden flex-col flex-1 shrink basis-0 min-w-[240px] max-md:max-w-full">
            <div className="flex w-full min-h-[40px] max-md:max-w-full" />
          </div>
          <div className="flex overflow-hidden flex-col flex-1 shrink text-base font-semibold text-white basis-0 min-w-[240px] max-md:max-w-full">
            <a href="/" className="max-md:max-w-full text-[16px] font-nats">Home</a>
            <div className="flex flex-col mt-4 w-full max-md:max-w-full">
              <a href="/contact" className="flex-1 shrink pb-2 w-full max-md:max-w-full text-[16px] font-nats">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}