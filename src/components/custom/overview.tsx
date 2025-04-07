import { motion } from 'framer-motion';
import { MessageCircle, BotIcon } from 'lucide-react';
import { Rocket } from 'lucide-react';


export const Overview = () => {
  return (
    <>
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.75 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
        <Rocket color="#FF4500" size={200} />
        {/* <span>+</span> */}
          {/* <MessageCircle size={130}/> */}
        </p>
        <p>
        Welcome to <strong>Xplor Segment Generator</strong><br />
        an AI Assistant that helps you create segments in simple language.<br />
        </p>
      </div>
    </motion.div>
    </>
  );
};
