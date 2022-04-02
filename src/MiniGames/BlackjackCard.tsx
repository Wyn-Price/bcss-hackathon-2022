import { useState } from "react";
import { Context } from "react";

const BlackjackCard = ({ value, suit }: { value: number; suit: string }) => {
  const images = require.context("../assets/card-pngs", true);

  // adding dynamic paths
  let image = images("./" + value + suit + ".png");

  return (
    <div className="max-h-[3rem]">
      <img src={image} />
    </div>
  );
};

export default BlackjackCard;
