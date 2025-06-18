import { motion } from 'framer-motion';
import biat from '../assets/image/biat.jpg'; 

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <motion.img
        src={biat}
        alt="Loading..."
        className="w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration:2,
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
