import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PostOfficeProps {
  className?: string;
}

export const PostOffice: React.FC<PostOfficeProps> = ({ className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeWindow, setActiveWindow] = useState<number | null>(null);

  const windowPositions = [
    { x: 20, y: 35, id: 1 },
    { x: 45, y: 35, id: 2 },
    { x: 70, y: 35, id: 3 },
    { x: 95, y: 35, id: 4 },
  ];

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg" />
      
      {/* Background Trees */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute left-4 top-8 w-16 h-20"
      >
        <div className="w-full h-full bg-green-600 rounded-full opacity-60" />
      </motion.div>

      {/* Main Building */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative z-10"
      >
        {/* Building Base */}
        <div className="relative mx-auto w-80 h-48 bg-amber-50 border-2 border-amber-200 rounded-t-lg">
          {/* Roof */}
          <div className="absolute -top-8 left-0 right-0 h-16 bg-orange-400 transform -skew-y-6" />
          
          {/* Dormer Windows */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute -top-4 left-8 w-6 h-8 bg-amber-50 border border-amber-300 rounded"
          >
            <div className="grid grid-cols-2 gap-0.5 p-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-blue-200 rounded-sm" />
              ))}
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute -top-4 right-8 w-6 h-8 bg-amber-50 border border-amber-300 rounded"
          >
            <div className="grid grid-cols-2 gap-0.5 p-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-blue-200 rounded-sm" />
              ))}
            </div>
          </motion.div>

          {/* Windows */}
          {windowPositions.map((window, index) => (
            <motion.div
              key={window.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              onHoverStart={() => setActiveWindow(window.id)}
              onHoverEnd={() => setActiveWindow(null)}
              className="absolute w-8 h-10 bg-amber-50 border-2 border-amber-300 rounded-t-lg"
              style={{ left: `${window.x}%`, top: `${window.y}%` }}
            >
              <div className="grid grid-cols-2 gap-0.5 p-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      backgroundColor: activeWindow === window.id ? '#93c5fd' : '#dbeafe'
                    }}
                    className="w-1.5 h-1.5 bg-blue-200 rounded-sm"
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Main Entrance */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-amber-100 border-2 border-amber-300 rounded-t-lg"
          >
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-16 bg-amber-200 border border-amber-400 rounded-t-lg">
                <div className="flex justify-center items-center h-full">
                  <div className="w-0.5 h-8 bg-amber-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Central Gable */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-32 h-12 bg-white border border-gray-300">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-4 h-4 bg-black rounded-full mb-1" />
              <div className="text-xs font-bold text-gray-700">STARÁ POŠTA</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mx-auto w-80">
          <div className="w-20 h-2 bg-amber-200 mx-auto" />
          <div className="w-24 h-2 bg-amber-300 mx-auto" />
        </div>
      </motion.div>

      {/* Rose Garlands */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Entrance Garland */}
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-32 h-8">
          <div className="flex justify-center">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                className="w-3 h-3 bg-pink-300 rounded-full mx-0.5"
              />
            ))}
          </div>
        </div>

        {/* Window Garlands */}
        {windowPositions.map((window, index) => (
          <div
            key={`garland-${window.id}`}
            className="absolute w-12 h-4"
            style={{ left: `${window.x - 2}%`, top: `${window.y - 8}%` }}
          >
            <div className="flex justify-center">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-pink-300 rounded-full mx-0.5"
                />
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Fence */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute bottom-8 left-0 right-0"
      >
        <div className="flex justify-center">
          <div className="w-80 h-8 bg-amber-200 border border-amber-300">
            <div className="flex justify-between items-center h-full px-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1 h-4 bg-amber-400" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Fence Roses */}
        <div className="flex justify-center mt-2">
          <motion.div
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-8 h-8 bg-pink-300 rounded-full mx-4"
          />
          <motion.div
            animate={{ rotate: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="w-8 h-8 bg-pink-300 rounded-full mx-4"
          />
        </div>
      </motion.div>

      {/* Shrubs */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="absolute bottom-16 left-8 w-6 h-8 bg-green-600 rounded-full opacity-80"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 2.2 }}
        className="absolute bottom-16 right-8 w-6 h-8 bg-green-600 rounded-full opacity-80"
      />

      {/* Location Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-2 left-0 right-0 text-center"
      >
        <div className="text-lg font-bold text-gray-700">KOVALOVICE</div>
      </motion.div>

      {/* Interactive Elements */}
      <div className="absolute inset-0">
        {windowPositions.map((window) => (
          <div
            key={`interactive-${window.id}`}
            className="absolute w-8 h-10 cursor-pointer"
            style={{ left: `${window.x}%`, top: `${window.y}%` }}
            onMouseEnter={() => setActiveWindow(window.id)}
            onMouseLeave={() => setActiveWindow(null)}
          />
        ))}
      </div>
    </div>
  );
};