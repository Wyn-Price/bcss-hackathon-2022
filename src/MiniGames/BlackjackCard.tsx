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

  return (
    <div className={marginDrop}>
      {image !== null ? <img alt="Card" src={image} /> : null}
    </div>
  );
};

export default BlackjackCard;
