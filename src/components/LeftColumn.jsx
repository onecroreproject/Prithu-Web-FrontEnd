import React from "react";
import Time from "./Time";
import ProfileStatus from "./ProfileStatus";

export default function LeftColumn() {
  return (

    <div className="flex flex-col gap-4 pr-2">
      <Time />
      <ProfileStatus/>
      
    </div>
  );
}
