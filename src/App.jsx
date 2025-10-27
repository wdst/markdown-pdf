import React, { useState, useEffect, useRef, useDeferredValue } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import mermaid from 'mermaid';
import html2pdf from 'html2pdf.js';
import 'katex/dist/katex.min.css';
import './App.css';
import exampleMarkdown from './example_ru.md?raw';
import exampleMarkdownEn from './example_en.md?raw';
import exampleMarkdownEs from './example_es.md?raw';
import { translations } from './translations';

function App() {
  const [language, setLanguage] = useState('ru');
  const [theme, setTheme] = useState('light');
  const [markdown, setMarkdown] = useState(exampleMarkdown);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  const t = translations[language];
  
  // Используем useDeferredValue для отложенного обновления превью
  const deferredMarkdown = useDeferredValue(markdown);
  
  // Индикатор того, что превью обновляется
  const isPending = deferredMarkdown !== markdown;

  const previewRef = useRef(null);
  const langDropdownRef = useRef(null);

  // Функция для переключения языка
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setIsLangDropdownOpen(false);
    // Обновляем содержимое в зависимости от языка
    if (newLanguage === 'en') {
      setMarkdown(exampleMarkdownEn);
    } else if (newLanguage === 'es') {
      setMarkdown(exampleMarkdownEs);
    } else {
      setMarkdown(exampleMarkdown);
    }
  };

  // Закрытие dropdown при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };

    if (isLangDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangDropdownOpen]);

  // Получение данных о языке для отображения
  const getLanguageData = (lang) => {
    const langData = {
      ru: { short: 'RU', full: 'Русский' },
      en: { short: 'EN', full: 'English' },
      es: { short: 'ES', full: 'Español' }
    };
    return langData[lang];
  };

  // Настройка marked
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  // Функция для рендера превью
  const renderPreview = async () => {
    if (previewRef.current) {
      try {
        let html = marked(deferredMarkdown);
        
        // Обработка математических формул после рендеринга
        html = html.replace(/\$([^$]+)\$/g, (match, formula) => {
          try {
            // Проверяем, содержит ли формула кириллические символы
            if (/[а-яё]/i.test(formula)) {
              return match; // Возвращаем оригинальную формулу без обработки
            }
            
            return katex.renderToString(formula, { 
              displayMode: false,
              strict: false, // Отключаем строгий режим
              throwOnError: false, // Не выбрасываем ошибки
              errorColor: '#cc0000'
            });
          } catch (e) {
            return match;
          }
        });
        
        html = html.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
          try {
            // Проверяем, содержит ли формула кириллические символы
            if (/[а-яё]/i.test(formula)) {
              return match; // Возвращаем оригинальную формулу без обработки
            }
            
            return katex.renderToString(formula, { 
              displayMode: true,
              strict: false, // Отключаем строгий режим
              throwOnError: false, // Не выбрасываем ошибки
              errorColor: '#cc0000'
            });
          } catch (e) {
            return match;
          }
        });
        
        previewRef.current.innerHTML = html;
        
        // Инициализация Mermaid диаграмм
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose'
        });
        
        // Рендер всех диаграмм Mermaid
        const mermaidElements = previewRef.current.querySelectorAll('pre code.language-mermaid');
        
        for (let i = 0; i < mermaidElements.length; i++) {
          const element = mermaidElements[i];
          try {
            const graphDefinition = element.textContent;
            if (graphDefinition.trim()) {
              const { svg } = await mermaid.render(`mermaid-${i}`, graphDefinition);
              element.parentElement.innerHTML = svg;
            }
          } catch (error) {
            element.parentElement.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px;">${t.errorMermaidDiagram} ${error.message}</div>`;
          }
        }
      } catch (error) {
        console.error('Ошибка рендеринга превью:', error);
        previewRef.current.innerHTML = `<div style="color: red; padding: 10px;">${t.errorRendering} ${error.message}</div>`;
      }
    }
  };

  // Обновление превью при изменении отложенного markdown
  useEffect(() => {
    const updatePreview = async () => {
      await renderPreview();
    };
    updatePreview();
  }, [deferredMarkdown]);

  // Функция для печати
  const handlePrint = () => {
    window.print();
  };

  // Функция для генерации PDF
  const generatePDF = async () => {
    if (previewRef.current) {
      try {
        // Сначала обновляем превью, чтобы все диаграммы были отрендерены
        await renderPreview();
        
        const element = previewRef.current;
      
      const opt = {
        margin: [0.5, 1, 1, 1], // [top, right, bottom, left] в дюймах
        filename: 'markdown-document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      // Добавляем стили для PDF
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 10px; /* уменьшен верхний отступ */
        }
        
        h1, h2, h3, h4, h5, h6 {
          color: #2c3e50;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        h1:first-child {
          margin-top: 0.5em; /* уменьшен отступ у первого заголовка */
        }
        
        h1 { font-size: 2em; border-bottom: 2px solid #3498db; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #bdc3c7; padding-bottom: 0.2em; }
        h3 { font-size: 1.3em; }
        
        p { margin-bottom: 1em; }
        
        code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background-color: #f8f9fa;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        pre {
          background-color: #f8f9fa;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        pre code {
          background: none;
          padding: 0;
        }
        
        blockquote {
          border-left: 4px solid #3498db;
          margin: 1em 0;
          padding-left: 1em;
          color: #666;
          font-style: italic;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 0.75em;
          text-align: left;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        ul, ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        li {
          margin-bottom: 0.5em;
        }
        
        a {
          color: #3498db;
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        .katex {
          font-size: 1.1em;
        }
        
        .katex-display {
          margin: 1em 0;
          text-align: center;
        }
      `;
      
      document.head.appendChild(style);
      
        html2pdf().set(opt).from(element).save().then(() => {
          document.head.removeChild(style);
        }).catch((error) => {
          console.error('Ошибка генерации PDF:', error);
          alert(t.errorGeneratingPDF + ' ' + error.message);
          document.head.removeChild(style);
        });
      } catch (error) {
        console.error('Ошибка подготовки PDF:', error);
        alert(t.errorPreparingPDF + ' ' + error.message);
      }
    }
  };

  return (
    <div className={`app ${theme}`}>
      <header className="header no-print">
        <div className="header-content">
          <div className="header-top-row">
            <h1 className="header-title">{t.title}</h1>
            
            <div className="header-right">
              <a 
                href="https://github.com/wdst/markdown-pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
                title="GitHub Repository"
              >
                <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
              </a>
              
              <div className="language-dropdown" ref={langDropdownRef}>
                <div 
                  className="selected-lang" 
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                >
                  <span className="lang-short">{getLanguageData(language).short}</span>
                  <span className={`arrow ${isLangDropdownOpen ? 'open' : ''}`}>▼</span>
                </div>
                {isLangDropdownOpen && (
                  <div className="lang-options">
                    <div 
                      className={`lang-option ${language === 'ru' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('ru')}
                    >
                      <span>{getLanguageData('ru').full}</span>
                    </div>
                    <div 
                      className={`lang-option ${language === 'en' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('en')}
                    >
                      <span>{getLanguageData('en').full}</span>
                    </div>
                    <div 
                      className={`lang-option ${language === 'es' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('es')}
                    >
                      <span>{getLanguageData('es').full}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="theme-toggle"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
          
          <div className="header-bottom-row">
            <button onClick={handlePrint} className="btn btn-secondary">
              <span className="btn-icon">🖨️</span>
              {t.print}
            </button>
            <button onClick={() => generatePDF()} className="btn btn-primary">
              <span className="btn-icon">📄</span>
              {t.saveToPDF}
            </button>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div className="editor-panel no-print">
          <h2>{t.markdownEditor}</h2>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="markdown-editor"
            placeholder={t.placeholder}
          />
        </div>
        
        <div className="preview-panel">
          <h2 className="no-print">
            {t.preview}
            {isPending && <span className="loading-indicator"> (обновляется...)</span>}
          </h2>
          <div ref={previewRef} className="markdown-preview"></div>
        </div>
      </div>
    </div>
  );
}

export default App;