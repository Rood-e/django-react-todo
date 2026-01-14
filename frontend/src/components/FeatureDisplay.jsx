const FeatureDisplay = ({ activeFeature }) => {

    console.log(activeFeature);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-8 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">

            {/* SVG per il Bordo Animato */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <rect
                    x="2"
                    y="2"
                    width="calc(100% - 4px)"
                    height="calc(100% - 4px)"
                    rx="16"
                    fill="transparent"
                    stroke={activeFeature.rgb}// Colore blue-500
                    strokeWidth="8" // Spessore visibile
                    pathLength="1"  // Normalizza la lunghezza a 1
                    className="animate-border-draw"
                    style={{
                        strokeDasharray: '1', // Valore arbitrario grande
                        strokeDashoffset: '1',
                    }}
                />
            </svg>

            {/* Contenuto della Feature */}
            <img
                src={activeFeature.img || '/placeholder.png'}
                alt={activeFeature.id}
                className="w-1/2 object-contain"
            />
            <p className="dark:text-white text-lg text-center">
                {activeFeature.desc}
            </p>
        </div>
    );
};

export default FeatureDisplay;