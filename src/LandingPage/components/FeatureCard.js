import * as React from "react";

export function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col gap-1 items-start mb-6"> {/* Adjusted layout and spacing */}
      <img loading="lazy" src={icon} alt="" className="object-contain shrink-0 w-14 aspect-[1.06]" />
      <div className="text-4xl font-bold text-cyan-600 w-full max-md:max-w-full text-[36px] font-abhaya">
        {title}
      </div>
      <div className="text-xl leading-8 text-black w-full max-md:max-w-full text-[20px] font-nats">
        {description}
      </div>
    </div>
  );
}
