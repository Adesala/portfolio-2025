import React, { useState } from 'react';
import { useMusic } from "../components/MusicProvider/MusicProvider";
import styles from '../assets/welcomeModal.module.scss';

const WelcomeModal = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { isPlaying, togglePlay } = useMusic();
    const handleClose = () => {
        setIsOpen(false);
        if (!isPlaying) {
            togglePlay();
        }
    };

    if (!isOpen) return null;

    return (
       <div role="alert" className={styles.welcomeModal}>
  <div className="flex items-start gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="-mt-0.5 size-6 text-white-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"></path>
    </svg>

    <div className="flex-1">
      <strong className="block leading-tight font-medium text-white-800"> Info </strong>

      <p className="mt-0.5 text-sm text-white-500">
        This portfolio use cookies and is best experienced on desktop. For the best experience, please visit on a desktop device with a modern browser and headphones.
      </p>

      <button onClick={handleClose} className="mt-2 inline-block rounded-sm border border-white-600 bg-white-600 px-4 py-2 text-sm/none font-medium text-white hover:bg-white hover:text-black" type="button">
        Accept
      </button>
    </div>
  </div>
</div>
    );
};

export default WelcomeModal;