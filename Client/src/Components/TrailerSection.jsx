import React, { useMemo, useState } from 'react'
import { dummyTrailers } from '../assets/assets'
import BlurCircle from './BlurCircle';
import { PlayCircleIcon } from 'lucide-react';

const TrailerSection = () => {

    const [currTrailer, setCurrTrailer] = useState(dummyTrailers[0]);

    const embedUrl = useMemo(() => {
      if (!currTrailer?.videoUrl) return '';
      try {
        // Accepts URLs like: https://www.youtube.com/watch?v=WpW36ldAqnM
        const url = new URL(currTrailer.videoUrl);
        const v = url.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
        // Fallback: if already an embed or youtu.be link
        if (url.hostname.includes('youtu.be')) {
          return `https://www.youtube.com/embed/${url.pathname.replace('/', '')}`;
        }
        if (url.pathname.startsWith('/embed/')) return currTrailer.videoUrl;
      } catch {}
      return currTrailer.videoUrl;
    }, [currTrailer]);
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
        <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>

        <div className='relative mt-6'>
            <BlurCircle top='-100px' right='-100px'/>
            <div className='mx-auto w-full max-w-[960px] aspect-video'>
              <iframe
                width='100%'
                height='100%'
                src={embedUrl}
                title='YouTube trailer player'
                frameBorder='0'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                referrerPolicy='strict-origin-when-cross-origin'
                allowFullScreen
              />
            </div>
        </div>

        <div className='group grid grid-cols-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
            {dummyTrailers.map((trailer) => (
                <div key={trailer.image} className='relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer' onClick={() => setCurrTrailer(trailer)}>
                    <img src={trailer.image} alt="trailer" className='rounded-lg w-full h-full object-cover brightness-75'/>
                    <PlayCircleIcon strokeWidth={1.6} className='absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2'/>
                </div>
            ))}
        </div>
    </div>
  )
}

export default TrailerSection
