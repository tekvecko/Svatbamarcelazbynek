import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PostOffice } from '../components/PostOffice';
import { Mail, MapPin, Clock, Phone, Info } from 'lucide-react';

interface PostOfficeInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const PostOfficePage: React.FC = () => {
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null);

  const postOfficeInfo: PostOfficeInfo[] = [
    {
      id: 'history',
      title: 'Historical Post Office',
      description: 'This charming post office in Kovalovice, Czech Republic, has been serving the community since the early 1900s. The building features traditional Czech architecture with its distinctive terracotta roof and decorative rose garlands.',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'services',
      title: 'Postal Services',
      description: 'The post office offers a full range of postal services including mail delivery, package handling, money transfers, and philatelic services. The friendly staff are always ready to help with your postal needs.',
      icon: <Mail className="w-5 h-5" />
    },
    {
      id: 'hours',
      title: 'Opening Hours',
      description: 'Monday - Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Closed\nHolidays: Special hours may apply',
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Phone: +420 123 456 789\nEmail: posta.kovalovice@cpost.cz\nAddress: Kovalovice 123, 12345 Kovalovice, Czech Republic',
      icon: <Phone className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Stará Pošta Kovalovice
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the charm of this historic Czech post office, beautifully adorned with rose garlands and traditional architecture
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Post Office Scene */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <PostOffice className="h-96" />
              
              {/* Interactive Instructions */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  💡 Hover over the windows to see them light up!
                </p>
                <div className="flex justify-center space-x-4 text-xs text-gray-400">
                  <span>🌹 Animated rose garlands</span>
                  <span>🏠 Interactive windows</span>
                  <span>🌳 Background elements</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Information Panel */}
          <div className="space-y-4">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center mb-4">
                <Info className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">About the Post Office</h2>
              </div>
              
              <div className="space-y-3">
                {postOfficeInfo.map((info) => (
                  <motion.button
                    key={info.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedInfo(selectedInfo === info.id ? null : info.id)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                      selectedInfo === info.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-blue-600 mr-3">{info.icon}</div>
                      <span className="font-medium text-gray-700">{info.title}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Selected Info Display */}
            {selectedInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center mb-3">
                  <div className="text-blue-600 mr-2">
                    {postOfficeInfo.find(info => info.id === selectedInfo)?.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    {postOfficeInfo.find(info => info.id === selectedInfo)?.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {postOfficeInfo.find(info => info.id === selectedInfo)?.description}
                </p>
              </motion.div>
            )}

            {/* Fun Facts */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-xl p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-3">Did You Know?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>🌹 The rose garlands are a traditional Czech decoration symbolizing welcome and hospitality</li>
                <li>🏛️ The building's architecture reflects the typical Moravian style from the early 20th century</li>
                <li>📮 The post horn symbol above the entrance is a universal postal service emblem</li>
                <li>🌍 Kovalovice is a small village in the South Moravian Region of the Czech Republic</li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-center mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-500 text-sm">
            Interactive Post Office Scene • Built with React, TypeScript, and Framer Motion
          </p>
        </motion.div>
      </div>
    </div>
  );
};