'use client';

import { useState, useRef, useEffect } from "react";

const TEXT_SOURCES = {
  chinese: [
    { text: "床前明月光，疑是地上霜。举头望明月，低头思故乡。", source: "李白《静夜思》" },
    { text: "君不见黄河之水天上来，奔流到海不复回。君不见高堂明镜悲白发，朝如青丝暮成雪。", source: "李白《将进酒》" },
    { text: "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。", source: "孟浩然《春晓》" },
    { text: "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。", source: "王之涣《登鹳雀楼》" },
    { text: "两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。", source: "杜甫《绝句》" },
    { text: "人闲桂花落，夜静春山空。月出惊山鸟，时鸣春涧中。", source: "王维《鸟鸣涧》" },
    { text: "千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。", source: "柳宗元《江雪》" },
    { text: "空山新雨后，天气晚来秋。明月松间照，清泉石上流。", source: "王维《山居秋暝》" }
  ],
  english: [
    { text: "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.", source: "Shakespeare - Hamlet" },
    { text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.", source: "Charles Dickens - A Tale of Two Cities" },
    { text: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore.", source: "Herman Melville - Moby Dick" },
    { text: "In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep.", source: "The Bible - Genesis" },
    { text: "All happy families are alike; each unhappy family is unhappy in its own way.", source: "Leo Tolstoy - Anna Karenina" },
    { text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", source: "Jane Austen - Pride and Prejudice" },
    { text: "Once upon a midnight dreary, while I pondered, weak and weary, over many a quaint and curious volume of forgotten lore.", source: "Edgar Allan Poe - The Raven" },
    { text: "I celebrate myself, and sing myself, and what I assume you shall assume, for every atom belonging to me as good belongs to you.", source: "Walt Whitman - Song of Myself" }
  ]
};

export default function Home() {
  const [language, setLanguage] = useState<'chinese' | 'english'>('chinese');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showSource, setShowSource] = useState(true);
  const [avgSpeed, setAvgSpeed] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{speed: number, accuracy: number}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentTexts = TEXT_SOURCES[language];
  const currentTextData = currentTexts[currentTextIndex];
  const currentTargetText = currentTextData.text;

  // 计算正确字符数
  const correctCount = input.split("").filter((ch, i) => ch === currentTargetText[i]).length;
  const isCompleted = input === currentTargetText;

  // 计算用时和速度
  const timeTaken = startTime && endTime ? ((endTime - startTime) / 1000) : null;
  const speed = timeTaken ? (currentTargetText.length / timeTaken * 60).toFixed(1) : null;
  
  // 计算正确率
  const accuracy = input.length > 0 ? ((correctCount / input.length) * 100).toFixed(1) : "0.0";

  // 播放完成音效
  const playCompletionSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // 静音模式，忽略音频错误
    }
  };

  // 计算平均速度
  const calculateAvgSpeed = () => {
    if (history.length > 0) {
      const totalSpeed = history.reduce((sum, h) => sum + h.speed, 0);
      setAvgSpeed(totalSpeed / history.length);
    }
  };

  // 处理输入
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (startTime === null && value.length > 0) {
      setStartTime(Date.now());
    }
    if (value === currentTargetText) {
      setEndTime(Date.now());
      playCompletionSound();
      if (speed) {
        setHistory(prev => [...prev, { speed: parseFloat(speed), accuracy: parseFloat(accuracy) }]);
      }
    }
    setInput(value);
  };

  // 高亮显示目标文本
  const renderTargetText = () => {
    return (
      <span className="font-mono text-lg">
        {currentTargetText.split("").map((ch, i) => {
          let color = "text-gray-400";
          if (input[i] === undefined) color = "text-gray-400";
          else if (input[i] === ch) color = "text-green-600";
          else color = "text-red-500";
          return (
            <span key={i} className={color}>
              {ch}
            </span>
          );
        })}
      </span>
    );
  };

  // 重置
  const handleReset = () => {
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // 进入下一条文本
  const handleNextText = () => {
    if (currentTextIndex < currentTexts.length - 1) {
      setCurrentTextIndex(currentTextIndex + 1);
      setInput("");
      setStartTime(null);
      setEndTime(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // 切换语言
  const handleLanguageChange = (lang: 'chinese' | 'english') => {
    setLanguage(lang);
    setCurrentTextIndex(0);
    setInput("");
    setStartTime(null);
    setEndTime(null);
  };

  // 切换主题
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // 更新平均速度
  useEffect(() => {
    calculateAvgSpeed();
  }, [history]);

  // 自动进入下一条文本
  useEffect(() => {
    if (isCompleted && currentTextIndex < currentTexts.length - 1) {
      const timer = setTimeout(() => {
        handleNextText();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, currentTextIndex, currentTexts.length]);

  // 确保输入框自动聚焦
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentTextIndex]); // 当文本切换时自动聚焦

  // 全局键盘事件监听，按任意键聚焦输入框
  useEffect(() => {
    const handleKeyPress = () => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="flex min-h-screen bg-black">
      {/* 右侧隐藏导航栏 */}
      <nav className="fixed right-0 top-0 h-full w-16 transition-all duration-300 ease-in-out hover:w-80 bg-gray-900 shadow-lg z-10 transform translate-x-12 hover:translate-x-0">
        <div className="h-full flex flex-col justify-center items-center space-y-4 py-8">
          <div className="writing-mode-vertical-rl text-sm font-medium text-gray-300 transform rotate-180 absolute left-2 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-100 hover:opacity-0 transition-opacity duration-300">
            设置
          </div>
          <div className="flex flex-col space-y-4 opacity-0 hover:opacity-100 transition-opacity duration-300 delay-150 px-4 w-full">
            <div className="text-sm font-semibold text-gray-300 mb-2">文本选择</div>
            <button 
              className={`p-2 rounded transition-colors text-sm ${language === 'chinese' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onClick={() => handleLanguageChange('chinese')}
            >
              中文经典
            </button>
            <button 
              className={`p-2 rounded transition-colors text-sm ${language === 'english' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onClick={() => handleLanguageChange('english')}
            >
              英文经典
            </button>
            
            <div className="text-sm font-semibold text-gray-300 mb-2">显示来源</div>
            <button 
              className={`p-2 rounded transition-colors text-sm ${showSource ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onClick={() => setShowSource(!showSource)}
            >
              {showSource ? '显示' : '隐藏'}
            </button>
            
            <div className="text-sm font-semibold text-gray-300 mb-2">主题</div>
            <button 
              className="p-2 rounded hover:bg-gray-800 transition-colors text-gray-300 text-sm"
              onClick={handleThemeToggle}
              title="主题切换"
            >
              {theme === 'dark' ? '浅色模式' : '深色模式'}
            </button>
            
            {avgSpeed && (
              <div className="text-sm text-gray-300">
                <div className="font-semibold">平均速度</div>
                <div>{avgSpeed.toFixed(1)} 字/分钟</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8 mr-16 text-white">
        <h1 className="text-2xl font-bold mb-2">打字练习</h1>
      
      <div className="text-sm text-gray-300 mb-2">
          文本 {currentTextIndex + 1} / {currentTexts.length}
        </div>
        
        {showSource && (
          <div className="text-xs text-gray-400 mb-2 italic">
            来源：{currentTextData.source}
          </div>
        )}
        
        <div>{renderTargetText()}</div>
      
      <input
          ref={inputRef}
          className="border border-gray-700 rounded px-3 py-2 w-full max-w-xl text-lg font-mono outline-none focus:ring-2 focus:ring-blue-400 bg-gray-900 text-white placeholder-gray-500"
          type="text"
          value={input}
          onChange={handleChange}
          disabled={isCompleted}
          placeholder="开始打字..."
          autoFocus
        />
      
      <div className="flex flex-col items-center gap-2">
        <div>进度：{input.length} / {currentTargetText.length}</div>
          <div>正确字符数：{correctCount}</div>
          <div>正确率：{accuracy}%</div>
          {speed && <div>打字速度：{speed} 字/分钟</div>}
          {avgSpeed && <div>平均速度：{avgSpeed.toFixed(1)} 字/分钟</div>}
          
          {isCompleted && (
            <>
              <div className="text-green-400 font-semibold">
                完成！用时：{timeTaken?.toFixed(2)} 秒，正确率：{accuracy}%，速度：{speed} 字/分钟
              </div>
              {currentTextIndex < currentTexts.length - 1 ? (
                <div className="text-blue-400 font-semibold">
                  2秒后自动进入下一条文本...
                </div>
              ) : (
                <div className="text-purple-400 font-semibold">
                  🎉 恭喜！您已完成所有文本练习！
                </div>
              )}
            </>
          )}
      </div>
      
      <div className="flex gap-4">
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={handleReset}
        >
          重置
        </button>
        
        {currentTextIndex < currentTexts.length - 1 && (
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
            onClick={handleNextText}
            disabled={!isCompleted}
          >
            下一条
          </button>
        )}
      </div>
    </main>
    
    <style jsx>{`
      .writing-mode-vertical-rl {
        writing-mode: vertical-rl;
      }
    `}</style>
  </div>
  );
}
