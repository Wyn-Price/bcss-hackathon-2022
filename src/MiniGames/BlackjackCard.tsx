import { useState } from "react";
import { Context } from "react";

const BlackjackCard = ({ value, suit }: { value: number; suit: string }) => {
  const images = require.context("../assets/card-pngs", true);

  // adding dynamic paths
  let image;
  try {
    image = images("./" + value + suit + ".png");
  } catch (error) {
    image = null;
  }

  return (
    <div className="max-h-100">
      <img className="object-contain h-60" src={image} />
    </div>
  );
};

export default BlackjackCard;
