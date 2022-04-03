import { useEffect, useState } from "react";
const BlackjackCard = ({ value, suit, marginDrop }: { value: number, suit: string, marginDrop: string }) => {
  const images = require.context("../assets/card-pngs", true);

  // adding dynamic paths
  console.log(marginDrop)
  let image;
  try {
    image = images("./" + value + suit + ".png");
  } catch (error) {
    image = null;
  }

  const [isCardSide, setCardSide] = useState(false)
  useEffect(() => {
    setTimeout(() => setCardSide(true), 1000)
  }, [])

  return (
    <div className={marginDrop + " transition-all duration-1000 " + (isCardSide ? "" : "-translate-x-[1000px]")}>
      {image !== null ? <img alt="Card" src={image} /> : null}
    </div>
  );
};

export default BlackjackCard;
