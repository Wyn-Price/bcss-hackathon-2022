
export default function ColorCard({color, onClick, flash}: {color: string, onClick: () => void, flash: boolean}) { //This function takes in the color and the event of an onClick
    return ( 
        <div 
            onClick={onClick} 
            className={`colorCard ${color} ${flash ? "flash" : ""}`}>
        </div>
    );
}