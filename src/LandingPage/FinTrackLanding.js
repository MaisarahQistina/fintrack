import * as React from "react";
import { NavBar } from "./components/NavBar";
import { FeatureCard } from "./components/FeatureCard";
import { Footer } from "./components/Footer";
import { features } from "./data/features";

export function FinTrackLanding() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col w-full max-md:max-w-full">
        <div className="flex flex-col w-full min-h-[900px] max-md:max-w-full">
          <div className="flex gap-2.5 items-center w-full min-h-[900px] max-md:max-w-full">
            <div className="flex overflow-hidden flex-col self-stretch my-auto bg-stone-100 w-[1440px] max-md:max-w-full">
              <NavBar />
              <div className="flex flex-col pl-16 mt-6 w-full max-md:pl-5 max-md:max-w-full">
                <div className="mr-6 max-md:mr-2.5 max-md:max-w-full">
                  <div className="flex gap-5 max-md:flex-col">
                    <div className="flex flex-col w-[76%] max-md:ml-0 max-md:w-full">
                      <div className="flex z-10 flex-col mt-16 w-full max-md:mt-10 max-md:mr-0 max-md:max-w-full">
                        {features.slice(0, 2).map((feature) => (
                          <div key={feature.id} className={feature.id === 2 ? "flex flex-wrap gap-1 items-start self-end mt-24 max-md:mt-10" : ""}>
                            <FeatureCard {...feature} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col ml-5 w-[24%] max-md:ml-0 max-md:w-full">
                      <div className="flex shrink-0 max-w-full h-[409px] w-[330px]" />
                    </div>
                  </div>
                </div>
                <div className="z-10 mt-0 max-md:max-w-full">
                  <div className="flex gap-5 max-md:flex-col">
                    <div className="flex flex-col w-[61%] max-md:ml-0 max-md:w-full">
                      <div className="flex flex-col mt-40 w-full max-md:mt-10 max-md:max-w-full">
                        <FeatureCard {...features[2]} />
                        <button className="flex items-start self-center mt-14 ml-24 max-w-full min-h-[50px] w-[200px] max-md:mt-10" tabIndex="0">
                          <div className="flex relative gap-2 justify-center items-start px-4 py-4 min-h-[50px] w-[200px]">
                            <div className="flex absolute inset-0 z-0 gap-2.5 items-start self-start min-h-[50px] w-[200px]">
                              <div className="flex flex-1 shrink w-full bg-sky-900 rounded basis-0 min-h-[50px]" />
                            </div>
                            <div className="z-0 my-auto text-xl font-semibold leading-none text-center text-white">
                              Get Started !
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col ml-5 w-[39%] max-md:ml-0 max-md:w-full">
                      <div className="flex shrink-0 max-w-full h-[459px] w-[511px] max-md:mt-10" />
                    </div>
                  </div>
                </div>
              </div>
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}