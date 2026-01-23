import React from "react";
import Time from "./Time";
import ProfileStatus from "./ProfileStatus";
import Hastags from './hashtag'
 
export default function LeftColumn() {
  return (
    <div className="h-fit flex flex-col gap-6 w-[350px]">
      <Time />
      <ProfileStatus/>
      <Hastags/>
    </div>
  );
}
 
