import * as React from "react";

export function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-wrap gap-1 items-start">
      <img loading="lazy" src={icon} alt="" className="object-contain shrink-0 w-14 aspect-[1.06]" />
      <div className="grow shrink text-4xl font-bold text-cyan-600 w-[664px] max-md:max-w-full text-[36px] font-abhaya">
        {title}
      </div>
      <div className="grow shrink text-xl leading-8 text-black w-[788px] max-md:max-w-full text-[20px] font-nats">
        {description}
      </div>
    </div>
  );
}