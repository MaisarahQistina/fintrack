import * as React from "react";
import { FeatureCard } from "./components/FeatureCard";
import { features } from "./data/features";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";

export function FinTrackLanding() {
  return (
    <div className="flex flex-col">
      <NavBar />
      <div className="flex flex-col w-full max-md:max-w-full">
        <div className="flex flex-col w-full min-h-screen max-md:max-w-full">
          <div className="flex items-center w-full min-h-screen max-md:max-w-full">
            <div
              className="flex overflow-hidden flex-col self-stretch my-auto w-full max-md:max-w-full"
              style={{
                background: "url('/Background.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex flex-col pl-16 mt-6 w-full max-md:pl-5 max-md:max-w-full">
                <div className="mr-6 max-md:mr-2.5 max-md:max-w-full">
                  <div className="flex max-md:flex-col justify-between">
                    <div className="flex flex-col w-[76%] max-md:ml-0 max-md:w-full">
                      <div className="flex z-10 flex-col mt-16 w-full max-md:mt-10 max-md:mr-0 max-md:max-w-full">
                        {features.slice(0, 2).map((feature, index) => (
                          <div
                            key={feature.id}
                            className={`flex ${
                              feature.id === 2
                                ? "flex-wrap items-start self-end mt-20 max-md:mt-10 feature-2"
                                : "feature-1-and-3"
                            }`}
                            style={{
                              marginLeft: feature.id === 2 ? "100px" : "0",
                              
                            }}
                          >
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
                <div className="z-10 mt-10 max-md:max-w-full">
                  <div className="flex max-md:flex-col justify-between">
                    <div className="flex flex-col w-[61%] max-md:ml-0 max-md:w-full">
                      <div className="flex flex-col mt-24 w-full max-md:mt-10 max-md:max-w-full">
                        <div className={`flex feature-1-and-3`}>
                          <FeatureCard {...features[2]} />
                        </div>
                        <button
                          className="flex items-start self-center mt-14 ml-24 max-w-full min-h-[50px] w-[200px] max-md:mt-10"
                          tabIndex="0"
                        >
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
                    <div className="flex flex-col ml-10 w-[39%] max-md:ml-0 max-md:w-full">
                      <div className="flex shrink-0 max-w-full h-[459px] w-[511px] max-md:mt-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
