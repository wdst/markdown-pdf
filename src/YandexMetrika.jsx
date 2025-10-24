// components/YandexMetrika.jsx
import { useEffect } from 'react';

const YandexMetrika = () => {
  useEffect(() => {
    const counterId = import.meta.env.VITE_YANDEX_METRIKA_ID;
    
    if (!counterId) {
      console.warn('Yandex Metrika ID not found');
      return;
    }

    // Ваш код Яндекс.Метрики с динамическим ID
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    ym(counterId, 'init', {
      ssr: true, 
      webvisor: true, 
      clickmap: true, 
      ecommerce: "dataLayer", 
      accurateTrackBounce: true, 
      trackLinks: true
    });
  }, []);

  return (
    <noscript>
      <div>
        <img 
          src={`https://mc.yandex.ru/watch/${import.meta.env.VITE_YANDEX_METRIKA_ID}`} 
          style={{ position: 'absolute', left: '-9999px' }} 
          alt="" 
        />
      </div>
    </noscript>
  );
};

export default YandexMetrika;