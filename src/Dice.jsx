import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Euler } from "three";
import { Plus, Minus } from "lucide-react";

const Dice = ({ targetFace, isRolling, diceRef }) => {
  const { scene } = useGLTF("/dicev2/scene.gltf");

  const faceRotations = {
    1: new Euler(0, 0, 0),
    2: new Euler(0, Math.PI / 2, 0),
    3: new Euler(-Math.PI / 2, 0, 0),
    4: new Euler(Math.PI / 2, 0, 0),
    5: new Euler(0, -Math.PI / 2, 0),
    6: new Euler(Math.PI, 0, 0),
  };

  useFrame((state, delta) => {
    if (isRolling && diceRef.current) {
      diceRef.current.rotation.x += delta * 10;
      diceRef.current.rotation.y += delta * 10;
      diceRef.current.rotation.z += delta * 10;
    } else if (!isRolling && diceRef.current) {
      diceRef.current.rotation.copy(faceRotations[targetFace]);
    }
  });

  return <primitive object={scene} scale={0.2} ref={diceRef} />;
};

const DiceRoller = () => {
  const [diceFace, setDiceFace] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [hiddenFace, setHiddenFace] = useState(null);
  const [isWinner, setIsWinner] = useState(false);
  const [rollLimit, setRollLimit] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const diceRef = useRef();

  const handleIncrement = () => {
    setRollLimit(prev => Math.min(prev + 1, 20));
  };

  const handleDecrement = () => {
    setRollLimit(prev => Math.max(prev - 1, 1));
  };

  const startGame = () => {
    setGameStarted(true);
    setHiddenFace(Math.floor(Math.random() * 6) + 1);
    setIsWinner(false);
    setGameOver(false);
    setRollCount(0);
  };

  const rollDice = () => {
    if (!gameStarted) startGame();

    setIsRolling(true);
    const face = Math.floor(Math.random() * 6) + 1;
    setDiceFace(face);

    setTimeout(() => {
      setIsRolling(false);
      setRollCount((prevCount) => prevCount + 1);

      if (face === hiddenFace) {
        setIsWinner(true);
        setGameStarted(false);
      } else if (rollCount + 1 >= rollLimit) {
        setGameOver(true);
        setGameStarted(false);
      }
    }, 1500);
  };

  const resetGame = () => {
    setDiceFace(1);
    setRollCount(0);
    setGameStarted(false);
    setHiddenFace(null);
    setIsWinner(false);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white px-4 py-8">
      <div className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">Dice Roller</div>
      
      <div className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px]">
        <Canvas>
          <ambientLight intensity={1} />
          <directionalLight position={[0, 0, 5]} intensity={2} />
          <Dice
            targetFace={diceFace}
            isRolling={isRolling}
            diceRef={diceRef}
          />
        </Canvas>
      </div>
      
      <div className="flex mt-4 items-center gap-2 sm:gap-4">
        <button
          onClick={handleDecrement}
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-1.5 sm:p-2 transition-colors"
          disabled={rollLimit <= 1}
        >
          <Minus size={20} />
        </button>
        <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px]">
          <div className="text-sm sm:text-lg font-semibold text-gray-300">Roll Limit</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-400">{rollLimit}</div>
        </div>
        <button
          onClick={handleIncrement}
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-1.5 sm:p-2 transition-colors"
          disabled={rollLimit >= 20}
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex mt-6 sm:mt-8 gap-3 sm:gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-sm sm:text-base transition-all duration-200 transform hover:scale-105"
          onClick={rollDice}
          disabled={isWinner || gameOver}
        >
          Roll Dice
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-sm sm:text-base transition-all duration-200 transform hover:scale-105"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>

      <div className="mt-6 sm:mt-8 text-base sm:text-xl font-semibold text-gray-300">
        Roll Count: <span className="text-blue-400">{rollCount}</span>
      </div>
      
      {hiddenFace && (
        <div className="mt-2 sm:mt-4 text-base sm:text-xl font-semibold text-gray-300">
          Target Face: <span className="text-blue-400">{hiddenFace}</span>
        </div>
      )}
      
      {isWinner && (
        <div className="mt-3 sm:mt-4 text-lg sm:text-2xl text-center text-green-400 font-bold animate-bounce px-4">
          Congratulations! You've rolled the target face!
        </div>
      )}
      
      {gameOver && (
        <div className="mt-3 sm:mt-4 text-lg sm:text-2xl text-center text-red-400 font-bold px-4">
          You didn't get the target face within the roll limit...
        </div>
      )}
    </div>
  );
};

export default DiceRoller;